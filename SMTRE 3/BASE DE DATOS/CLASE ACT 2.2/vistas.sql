-- Se crea la vista
CREATE OR REPLACE VIEW v_cliente
AS SELECT 
    TO_CHAR(c.NUMRUN_CLI, '99G999G999') || '-' || c.DVRUN_CLI RUN_CLIENTE,
    TO_CHAR(c.NUMRUN_CLI, '99G999G999') || '-' || c.DVRUN_CLI "RUT CLIENTE 2",
    c.PNOMBRE_CLI || ' ' ||
    c.SNOMBRE_CLI || ' ' ||
    c.APPATERNO_CLI || ' ' ||
    c.APMATERNO_CLI NOMBRE_CLIENTE,
    c.direccion DIRECCION
FROM CLIENTE c;

-- Se muestra la vista
SELECT * FROM v_cliente;

-- Muestra solo los clientes que se llaman Juan en la vista
SELECT * FROM v_cliente
WHERE NOMBRE_CLIENTE LIKE '%JUAN%';

-- Llama el rut del cliente con comillas doble "" para poder poner espacios
-- Muestra solo los clientes que su rut comiencen en 13
SELECT * FROM v_cliente
WHERE "RUT CLIENTE 2" LIKE '%13%';

-- Muestra cuantos clientes en total hay
SELECT COUNT(*) CLIENTES_EN_TOTAL FROM v_cliente;
