package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.users.Streamer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSpringDataRepository extends CrudRepository<AccountEntity, String> {

    List<AccountEntity> findAllByIdIn(List<String> ids);

    List<Streamer> findAllStreamersByIdIn(List<String> ids);
}
