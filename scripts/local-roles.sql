-- Local credentials only. Production roles are provisioned separately by infrastructure.
CREATE ROLE voicely_api LOGIN PASSWORD 'api-local';
CREATE ROLE voicely_worker LOGIN PASSWORD 'worker-local';
