package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.OAuthResponse;

public interface OAuthRepository {
    OAuthResponse authByAuthorizationCode(String code);

    Account getAccount(String token, String tokenType);
}
