package com.appganjah.backend.domain.repository;

import com.appganjah.backend.domain.model.MatchDay;
import java.util.List;
import java.util.Optional;

public interface MatchDayRepository {
    MatchDay save(MatchDay matchDay);
    List<MatchDay> findAll();
    Optional<MatchDay> findById(Long id);
    void deleteById(Long id);
}
