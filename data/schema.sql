DROP TABLE IF EXISTS tv_mov;
CREATE TABLE tv_mov(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    overview VARCHAR(1024),
    poster_path VARCHAR(255)
)