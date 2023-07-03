package com.waktoolbox.waktool.domain.repositories;

public interface DiscordRepository {

    boolean isGuildMember(String guildId, String userId);
}
