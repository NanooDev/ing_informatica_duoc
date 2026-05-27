select * from sucursal_retail;
select * from cliente;
select * from tipo_transaccion_tarjeta;
select * from producto;
select * from transaccion_tarjeta_cliente where cod_tptran_tarjeta in (102,103);
select * from tarjeta_cliente;

select tc.NUMRUN,
       tc.NRO_TARJETA,
       tt.NRO_TRANSACCION,
       tt.COD_TPTRAN_TARJETA,
       COUNT(DISTINCT tt.NRO_TRANSACCION) CANTIDAD_COMPRAS,
       SUM(DISTINCT tt.MONTO_TRANSACCION) MONTO_TRANSACCION,
       DECODE (tt.COD_TPTRAN_TARJETA, 102, 1                      , 0) TRANSACCION_AVANCE,
       DECODE (tt.COD_TPTRAN_TARJETA, 102,     SUM(ct.VALOR_CUOTA), 0) MONTO_AVANCE_VIGENTE,
       DECODE (tt.COD_TPTRAN_TARJETA, 103, 1                      , 0) TRANSACCION_SUPER_AVANCE,
       DECODE (tt.COD_TPTRAN_TARJETA, 103, SUM(ct.VALOR_CUOTA)    , 0) MONTO_SUPER_AVANCE_VIGENTE
FROM TARJETA_CLIENTE tc
    JOIN TRANSACCION_TARJETA_CLIENTE tt 
        ON (tt.NRO_TARJETA = tc.NRO_TARJETA AND
            tt.COD_TPTRAN_TARJETA IN (102,103) -- 102 Avance / 103 Super Avance
           )
    JOIN CUOTA_TRANSAC_TARJETA_CLIENTE ct
        ON (ct.NRO_TARJETA       = tt.NRO_TARJETA     AND
            ct.NRO_TRANSACCION   = tt.NRO_TRANSACCION AND
            ct.FECHA_VENC_CUOTA >= SYSDATE
           )
WHERE tc.NRO_TARJETA = 31021713767
GROUP BY tc.NUMRUN,
         tc.NRO_TARJETA,
         tt.NRO_TRANSACCION,
         tt.COD_TPTRAN_TARJETA
         --tt.MONTO_TRANSACCION;
         ;
         
select * from transaccion_tarjeta_cliente where cod_tptran_tarjeta in (102,103) AND NRO_TARJETA = 31021713767;

SELECT * FROM CUOTA_TRANSAC_TARJETA_CLIENTE
WHERE NRO_TARJETA = 31021713767 AND NRO_TRANSACCION = 1002;




