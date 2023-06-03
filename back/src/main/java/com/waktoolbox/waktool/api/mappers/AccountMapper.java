package com.waktoolbox.waktool.api.mappers;

import com.waktoolbox.waktool.api.models.AccountResponse;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.utils.mapper.TemplateMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountMapper extends TemplateMapper<Account, AccountResponse> {

}
