package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.Account;

import java.util.List;
import java.util.Optional;

public interface AccountRepository {

    Account save(Account account);

    Optional<Account> find(String id);

    List<Account> find(List<String> id);
}
