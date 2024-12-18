package com.waktoolbox.waktool.infra.repositories.models;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class DiscordMessage {
    String content;
    List<DiscordEmbed> embeds;
}
