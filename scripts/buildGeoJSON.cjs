const fs = require('fs');
const axios = require('axios');
const turf = require('@turf/turf');

async function buildGeoJSON() {
  console.log('Downloading GeoJSON...');
  try {
    // Let's use a known dataset from Open Development Mekong or similar.
    // Actually, let's use the one found in search:
    const url = 'https://raw.githubusercontent.com/Vizzuality/growasia_calculator/master/public/vietnam.geojson';
    const res = await axios.get(url);
    let vnGeo = res.data;

    console.log('Downloaded Vietnam GeoJSON, features:', vnGeo.features?.length);

    // Some datasets might not have Spratly/Paracel. Let's explicitly append them if needed.
    const hoangSa = turf.polygon([[
        [111.0, 17.0], [111.0, 15.5], [113.0, 15.5], [113.0, 17.0], [111.0, 17.0]
    ]], { Name_1: "Quần đảo Hoàng Sa (Đà Nẵng)", TYPE_1: "Đảo" });
    
    const truongSa = turf.polygon([[
        [111.5, 11.5], [111.5, 7.0], [117.0, 7.0], [117.0, 11.5], [111.5, 11.5]
    ]], { Name_1: "Quần đảo Trường Sa (Khánh Hòa)", TYPE_1: "Đảo" });

    vnGeo.features.push(hoangSa);
    vnGeo.features.push(truongSa);

    // Create World Polygon
    const worldPolygon = turf.polygon([[
        [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
    ]]);

    console.log('Unioning Vietnam features...');
    // Union all Vietnam features to create one big polygon for the hole
    let vnUnion = vnGeo.features[0];
    for (let i = 1; i < vnGeo.features.length; i++) {
        try {
            if (vnGeo.features[i].geometry) {
                vnUnion = turf.union(turf.featureCollection([vnUnion, vnGeo.features[i]]));
            }
        } catch(e) {
            console.log('Error unioning feature', i);
        }
    }

    console.log('Creating Mask...');
    let mask;
    try {
        mask = turf.difference(turf.featureCollection([worldPolygon, vnUnion]));
    } catch(e) {
        console.log('Fallback mask creation...');
        mask = worldPolygon; // fallback
    }

    const output = {
        provinces: vnGeo,
        mask: mask
    };

    fs.writeFileSync('c:/Users/Minh/Documents/Web4Fun/src/data/vietnamData.json', JSON.stringify(output));
    console.log('Done writing vietnamData.json');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

buildGeoJSON();
