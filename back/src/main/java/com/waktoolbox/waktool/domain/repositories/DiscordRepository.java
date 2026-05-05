package com.waktoolbox.waktool.domain.repositories;

public interface DiscordRepository {

    boolean isGuildMember(String guildId, String userId);

    String createRole(String guildId, String roleName);

    void assignRoleToUser(String guildId, String userId, String roleId);

    void removeRoleFromUser(String guildId, String userId, String roleId);

    void deleteRole(String guildId, String roleId);
}
