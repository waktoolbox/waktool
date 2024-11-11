package com.waktoolbox.waktool.infra.cron;

import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.infra.db.*;
import com.waktoolbox.waktool.infra.repositories.DiscordRepositoryImpl;
import com.waktoolbox.waktool.infra.repositories.models.DiscordEmbed;
import com.waktoolbox.waktool.infra.repositories.models.DiscordEmbedImage;
import com.waktoolbox.waktool.infra.repositories.models.DiscordMessage;
import com.waktoolbox.waktool.utils.Translator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static java.util.Optional.ofNullable;

@RequiredArgsConstructor
@Service
@Slf4j
public class MatchNotificationTaskScheduler implements Runnable {
    @Value("${waktool.base-url}")
    private String baseUrl;

    private final Clock clock;
    private final TeamSpringDataRepository teamRepository;
    private final TournamentMatchSpringDataRepository tournamentMatchRepository;
    private final TournamentSpringDataRepository tournamentRepository;
    private final Translator translator;
    private final DiscordRepositoryImpl discordRepository;

    private static final String MAP_IMAGE_URL = "%s/maps/%s.jpg";
    private static final String NOTIFICATION_TITLE = ":crossed_swords: **%s** vs **%s** :crossed_swords:";
    private static final String NOTIFICATION_DESCRIPTION = "%s / %s";
    private static final String NOTIFICATION_URL = "%s/tournament/%s/tab/4/match/%s";

    @Override
    @Scheduled(cron = "0 */1 * * * *")
    public void run() {
        tournamentRepository.getTournamentsToNotify().forEach(this::notifyForTournament);
    }

    private void notifyForTournament(TournamentToNotify tournament) {
        Instant minBound = clock.instant().plus(15, ChronoUnit.MINUTES);
        Instant maxBound = clock.instant().plus(16, ChronoUnit.MINUTES);
        tournamentMatchRepository.getMatchesToNotify(tournament.getTournamentId(), minBound, maxBound).forEach(match -> notifyMatch(tournament.getChannelId(), match));
    }

    private void notifyMatch(String channelId, TournamentMatchEntity matchEntity) {
        try {
            TournamentMatch match = matchEntity.getContent();
            if (match.getTeamA() == null || match.getTeamB() == null) return;

            Optional<TeamEntity> optTeamA = teamRepository.findById(match.getTeamA());
            Optional<TeamEntity> optTeamB = teamRepository.findById(match.getTeamB());
            if (optTeamA.isEmpty() || optTeamB.isEmpty()) return;

            Team teamA = optTeamA.get().getContent();
            Team teamB = optTeamB.get().getContent();

            List<String> usersToMention = new ArrayList<>();
            ofNullable(match.getReferee()).ifPresent(usersToMention::add);
            usersToMention.addAll(teamA.getValidatedPlayers());
            usersToMention.addAll(teamB.getValidatedPlayers());

            int map = match.getRounds().getFirst().getMap();
            String frMapName = translator.get("map.%d".formatted(map), Locale.FRENCH);
            String enMapName = translator.get("map.%d".formatted(map), Locale.ENGLISH);
            DiscordEmbed embed = DiscordEmbed.builder()
                    .title(NOTIFICATION_TITLE.formatted(teamA.getName(), teamB.getName()))
                    .description(NOTIFICATION_DESCRIPTION.formatted(frMapName, enMapName))
                    .url(NOTIFICATION_URL.formatted(baseUrl, matchEntity.getTournamentId(), matchEntity.getId()))
                    .timestamp(DateTimeFormatter.ISO_LOCAL_DATE_TIME.withZone(ZoneId.from(ZoneOffset.UTC)).format(match.getDate()))
                    .image(DiscordEmbedImage.builder().url(MAP_IMAGE_URL.formatted(baseUrl, map)).build())
                    .build();

            List<DiscordEmbed> embeds = List.of(embed);
            StringJoiner joiner = new StringJoiner(" ");
            usersToMention.stream().map("<@%s>"::formatted).forEach(joiner::add);

            DiscordMessage message = DiscordMessage.builder()
                    .content("||%s||".formatted(joiner.toString()))
                    .embeds(embeds)
                    .build();

            discordRepository.notifyChannel(channelId, message);
        } catch (Exception e) {
            log.error("Unable to notify match {}", matchEntity.getId(), e);
        }
    }
}
