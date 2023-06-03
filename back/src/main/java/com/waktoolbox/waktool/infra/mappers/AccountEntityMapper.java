package com.waktoolbox.waktool.infra.mappers;

import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.infra.db.AccountEntity;
import com.waktoolbox.waktool.utils.mapper.TemplateMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountEntityMapper extends TemplateMapper<AccountEntity, Account> {
}
