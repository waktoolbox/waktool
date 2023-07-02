package com.waktoolbox.waktool.infra.db;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSpringDataRepository extends CrudRepository<AccountEntity, String> {

    List<AccountEntity> findAllByIdIn(List<String> ids);
}
