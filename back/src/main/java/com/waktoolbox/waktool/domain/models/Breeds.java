package com.waktoolbox.waktool.domain.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum Breeds {
    FECA(1),
    OSAMODAS(2),
    ENUTROF(3),
    SRAM(4),
    XELOR(5),
    ECAFLIP(6),
    ENIRIPSA(7),
    IOP(8),
    CRA(9),
    SADIDA(10),
    SACRIER(11),
    PANDAWA(12),
    ROUBLARD(13),
    ZOBAL(14),
    OUGINAK(15),
    STEAMER(16),
    ELIOTROPE(18),
    HUPPERMAGE(19);

    public static final int MAX_BREED_ID = 19;

    private final byte id;

    Breeds(int id) {
        this.id = (byte) id;
    }

    @JsonValue
    public byte getId() {
        return id;
    }

    @JsonCreator
    public static Breeds fromId(Byte id) {
        if (id == null) return null;
        for (Breeds breed : values()) {
            if (breed.id == id) {
                return breed;
            }
        }
        return null;
    }
}
