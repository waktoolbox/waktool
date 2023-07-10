package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.users.Streamer;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.infra.mappers.AccountEntityMapper;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class AccountEntityRepositoryImpl implements AccountRepository {
    private final AccountSpringDataRepository accountSpringDataRepository;
    private final AccountEntityMapper accountEntityMapper;

    @Override
    public Account save(Account account) {
        return accountEntityMapper.to(accountSpringDataRepository.save(accountEntityMapper.from(account)));
    }

    @Override
    public Optional<Account> find(String id) {
        return accountSpringDataRepository.findById(id).map(accountEntityMapper::to);
    }

    @Override
    public List<Account> find(List<String> ids) {
        return accountEntityMapper.to(accountSpringDataRepository.findAllByIdIn(ids));
    }

    @Override
    public List<Streamer> findStreamers(List<String> ids) {
        return accountSpringDataRepository.findAllStreamersByIdIn(ids);
    }
}
