INSERT INTO hospitals (id, name, location_region, capacity, supervisor_id)
VALUES
(1, 'Tampa Hospital', 'Tampa', 50, 101),
(2, 'Orlando Hospital', 'Orlando', 100, 102),
(3, 'Miami Hospital', 'Miami', 200, 103);


INSERT INTO equipments (id, serial_number, model, status, charge_level, facility_id)
VALUES
(1, 'Equi-1001', 'Model-1', 'Available', 100.00, 1),
(2, 'Equi-1002', 'Model-2', 'In-Use', 80.00, 2),
(3, 'Equi-1003', 'Model-1', 'Maintenance', 40.00, 3),
(4, 'Equi-1004', 'Model-3', 'Maintenance', 50.00, 1),
(5, 'Equi-1005', 'Model-3', 'Offline', 10.00, 3),
(6, 'Equi-1006', 'Model-2', 'In-Use', 15.00, 2);

INSERT INTO technicians (id, name, facility_id, supervisor_id)
VALUES
(201, 'Jason', 1, 101),
(202, 'Tom', 2, 102),
(203, 'Jerry', 3, 103),
(204, 'Bob', 1, 101),
(205, 'Lee', 3, 103);

INSERT INTO work_orders (id, title, priority, status, equipment_id, technician_id)
VALUES
(1, 'Inspect Infusion Pump', 'Critical', 'Pending', 3, 203),
(2, 'Replace Ventilator Battery', 'Medium', 'In-Progress', 5, 202),
(3, 'Repair Patient Monitor', 'Critical', 'Pending', 4, 201),
(4, 'Run Equipment Diagnostic', 'Medium', 'Completed', 1, 204),
(5, 'Perform Preventive Maintenance', 'Low', 'Failed', 2, 202);

INSERT INTO service_reports (id, work_order_id, file_url, notes, timestamp)
VALUES
(1, 1, 's3://medflow-service-reports/report-001.pdf',
 'Patient monitor inspected. Device requires additional maintenance before returning to service.',
 CURRENT_TIMESTAMP);
