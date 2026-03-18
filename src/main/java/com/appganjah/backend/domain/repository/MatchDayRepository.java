package com.appganjah.backend.domain.repository;

import com.appganjah.backend.domain.model.MatchDay;
import java.util.List;

public interface MatchDayRepository {
    MatchDay save(MatchDay matchDay);
    List<MatchDay> findAll();
}
