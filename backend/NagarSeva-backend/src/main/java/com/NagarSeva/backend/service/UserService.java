package com.NagarSeva.backend.service;


import com.NagarSeva.backend.model.User;
import com.NagarSeva.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void updateOfficialLocation(UUID id, Double latitude, Double longitude) {

        User official = userRepository.findById(id).orElse(null);
        if(official != null) {
            GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
            Point location = gf.createPoint(new Coordinate(longitude, latitude));
            official.setLastLocation(location);
            official.setLastOnlineAt(ZonedDateTime.now());
            userRepository.save(official);
        }
    }
}
