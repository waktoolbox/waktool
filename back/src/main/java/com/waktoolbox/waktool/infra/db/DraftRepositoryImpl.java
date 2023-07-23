package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.drafts.Draft;
import com.waktoolbox.waktool.domain.repositories.DraftRepository;
import com.waktoolbox.waktool.infra.mappers.DraftEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DraftRepositoryImpl implements DraftRepository {
    private final DraftEntityMapper _draftEntityMapper;
    private final DraftSpringDataRepository _draftRepository;

    @Override
    public Draft save(Draft draft) {
        return Optional.of(draft)
                .map(_draftEntityMapper::from)
                .map(data -> new DraftEntity(draft.getId(), data))
                .map(_draftRepository::save)
                .map(saved -> {
                    Draft savedDraft = _draftEntityMapper.to(saved.getContent());
                    savedDraft.setId(saved.getId());
                    return savedDraft;
                })
                .orElseThrow(() -> new RuntimeException("Failed to save draft"));
    }

    @Override
    public void delete(String id) {
        _draftRepository.deleteById(id);
    }

    @Override
    public Draft load(String id) {
        return _draftRepository
                .findById(id)
                .map(entity -> {
                    Draft draft = _draftEntityMapper.to(entity.getContent());
                    draft.setId(entity.getId());
                    return draft;
                })
                .orElse(null);
    }
}
