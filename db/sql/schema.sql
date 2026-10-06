CREATE TYPE equipment_status AS ENUM ('Available', 'In-Use', 'Maintenance', 'Offline');
CREATE TYPE work_order_priority AS ENUM ('Low', 'Medium', 'Critical');
CREATE TYPE work_order_status AS ENUM ('Pending', 'In-Progress', 'Completed', 'Failed');

CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_region VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    supervisor_id INTEGER NOT NULL
);

CREATE TABLE equipments (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'Available',
    charge_level NUMERIC(5, 2) NOT NULL CHECK (charge_level BETWEEN 0 AND 100),
    facility_id INTEGER REFERENCES hospitals(id)
);

CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    facility_id INTEGER NOT NULL REFERENCES hospitals(id),
    supervisor_id INTEGER NOT NULL
);

CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    priority work_order_priority NOT NULL,
    status work_order_status NOT NULL DEFAULT 'Pending',
    equipment_id INTEGER NOT NULL REFERENCES equipments(id),
    technician_id INTEGER NOT NULL REFERENCES technicians(id)
);

CREATE TABLE service_reports(
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL REFERENCES work_orders(id),
    file_url TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);