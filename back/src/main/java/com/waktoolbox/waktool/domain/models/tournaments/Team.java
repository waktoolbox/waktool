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
    Byte bannedBreed;
    String tournament;
    String catchPhrase;
    TeamStats stats;
    boolean displayOnTeamList;
    List<String> validatedPlayers;

    public static List<Byte> extractValidBreeds(List<Byte> breeds, int limit) {
        return ofNullable(breeds)
                .map(Collection::stream)
                .map(s -> s.filter(Objects::nonNull))
                .map(Stream::distinct)
                .map(s -> s.limit(limit))
                .map(s -> s.collect(Collectors.toList()))
                .orElse(null);
    }

    public static boolean isValidBannedBreed(Byte bannedBreed, List<Byte> breeds) {
        if (bannedBreed == null) return false;
        if (bannedBreed < 1 || bannedBreed > Breeds.MAX_BREED_ID) return false;
        return breeds == null || !breeds.contains(bannedBreed);
    }
}
