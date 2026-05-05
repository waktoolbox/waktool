package com.waktoolbox.waktool.domain.models.tournaments;

import com.waktoolbox.waktool.domain.models.Breeds;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Optional.ofNullable;

@Getter
@Setter
public class Team implements Serializable {
    String id;
    String name;
    String leader;
    String server;
    List<String> players;
    List<Byte> breeds;
    List<Byte> bannedBreeds;
    String tournament;
    String catchPhrase;
    TeamStats stats;
    boolean displayOnTeamList;
    List<String> validatedPlayers;
    String discordRoleId;

    public static List<Byte> extractValidBreeds(List<Byte> breeds, int limit) {
        return ofNullable(breeds)
                .map(Collection::stream)
                .map(s -> s.filter(Objects::nonNull))
                .map(Stream::distinct)
                .map(s -> s.limit(limit))
                .map(s -> s.collect(Collectors.toList()))
                .orElse(null);
    }

    public static boolean areValidBannedBreeds(List<Byte> bannedBreeds, List<Byte> breeds, int requiredCount) {
        if (bannedBreeds == null || bannedBreeds.size() != requiredCount) return false;
        for (Byte banned : bannedBreeds) {
            if (banned == null) return false;
            if (banned < 1 || banned > Breeds.MAX_BREED_ID) return false;
            if (breeds != null && breeds.contains(banned)) return false;
        }
        if (bannedBreeds.stream().distinct().count() != requiredCount) return false;
        return true;
    }
}
