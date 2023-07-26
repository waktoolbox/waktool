package com.waktoolbox.waktool.infra.db;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "accounts")
public class AccountEntity {
    @Id
    String id;

    @Column
    String globalName;

    @Column
    String username;

    @Column
    String discriminator;

    @Column
    String email;

    @Column
    String ankamaName;

    @Column
    String ankamaDiscriminator;

    @Column
    String twitchUrl;

    @Column
    String locale;
}
