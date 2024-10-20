package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Optional.ofNullable;

@Getter
@Setter
public class Team {
    String id;
    String name;
    String leader;
    String server;
    List<String> players;
    List<Byte> breeds;
    String tournament;
    String catchPhrase;
    TeamStats stats;
    boolean displayOnTeamList;
    List<String> validatedPlayers;

    public static List<Byte> extractValidBreeds(List<Byte> breeds) {
        return ofNullable(breeds)
                .map(Collection::stream)
                .map(s -> s.filter(Objects::nonNull))
                .map(Stream::distinct)
                .map(s -> s.limit(6))
                .map(s -> s.collect(Collectors.toList()))
                .orElse(null);
    }
}
