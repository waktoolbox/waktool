package com.waktoolbox.waktool.infra.repositories.models;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DiscordEmbed {
    String title;
    String description;
    String url;
    DiscordEmbedImage image;
    String timestamp;
}
