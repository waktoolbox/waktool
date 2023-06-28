package com.waktoolbox.waktool.infra.mappers;

import com.waktoolbox.waktool.domain.models.drafts.Draft;
import com.waktoolbox.waktool.infra.db.DraftEntity;
import com.waktoolbox.waktool.utils.mapper.TemplateMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DraftEntityMapper extends TemplateMapper<DraftEntity.DraftData, Draft> {
}
