package com.waktoolbox.waktool.infra.db;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountSpringDataRepository extends CrudRepository<AccountEntity, String> {

}
