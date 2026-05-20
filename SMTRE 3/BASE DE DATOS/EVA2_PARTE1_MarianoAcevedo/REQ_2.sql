
----------------------------------------------------------------------

-- Conectado con el Usuario: MACEVEDO_ADM
-- REQUERIMIENTO 2: Actualizacion de datos
-- Se intercambian los códigos 4 y 8 segun lo solicitado
-- Usamos CASE para realizar el cambio en un solo paso.
UPDATE CLIENTE 
SET CODCOMUNA = CASE 
WHEN CODCOMUNA = 8 THEN 4 
WHEN CODCOMUNA = 4 THEN 8 END 
WHERE CODCOMUNA IN (4, 8);

-- Guardamos los cambios definitivamente
COMMIT;
