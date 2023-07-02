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
@Table(name = "applications")
public class ApplicationEntity {
    @Id
    String id;

    @Column
    String tournamentId;

    @Column
    String userId;

    @Column
    String teamId;
}
