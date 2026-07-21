-- Requerimiento 3: Creamos la vista que genera los correos de los postulantes
CREATE OR REPLACE VIEW V_INFORME_POSTULANTES AS
SELECT 
    ap.numrun || '-' || ap.dvrun AS RUN,
    ap.apaterno AS APATERNO,
    ap.amaterno AS AMATERNO,
    ap.pnombre || ' ' || NVL(ap.snombre, '') AS NOMBRES,
    TO_CHAR(ap.fecha_nacimiento, 'DD/MM/YYYY') AS FECHA_NACIMIENTO,
    NVL2(ap.cod_pueblo_ind, 'SI', 'NO') AS PUEBLO_INDIGENA,
    (SELECT COUNT(DISTINCT establecimiento) 
     FROM BDY1102_ET_FA_MACEVEDO.ANTECEDENTES_LABORALES 
     WHERE numrun = ap.numrun) AS INSTITUCIONES,
    SUBSTR(TO_CHAR(ap.numrun), 4, 1) ||
    ROUND(EXTRACT(YEAR FROM ap.fecha_nacimiento) * 0.7) ||
    (SUBSTR(TO_CHAR(ap.numrun), -3, 3) - 1) ||
    CASE WHEN ap.cod_pueblo_ind IS NULL 
         THEN UPPER(SUBSTR(ap.apaterno, 1, 2)) 
         ELSE UPPER(SUBSTR(ap.amaterno, 1, 2)) 
    END || '@direduca.edu' AS CORREO
FROM BDY1102_ET_FA_MACEVEDO.ANTECEDENTES_PERSONALES ap
ORDER BY ap.apaterno, ap.amaterno, ap.pnombre;


-- Requerimiento 4.1: Proceso PL/SQL que calcula los puntajes
DECLARE
    -- Cursor para iterar postulante por postulante
    CURSOR c_postulantes IS 
        SELECT p.numrun, p.pnombre, p.apaterno, p.amaterno, p.cod_pueblo_ind, p.fecha_nacimiento, 
               post.cod_programa
        FROM BDY1102_ET_FA_MACEVEDO.ANTECEDENTES_PERSONALES p
        JOIN BDY1102_ET_FA_MACEVEDO.POSTULACION_PASANTIA_PERFEC post ON p.numrun = post.numrun;
        
    -- Variables para guardar los calculos y datos de la fila
    v_ptje_indigena NUMBER(4);
    v_anios_exp NUMBER(2);
    v_ptje_exp NUMBER(4);
    v_cod_pais NUMBER(3);
    v_ptje_pais NUMBER(4);
    v_ptje_extra NUMBER(4);
    v_ptje_final NUMBER(6);
    v_resultado VARCHAR2(20);
    v_nombre_completo VARCHAR2(60);
    v_edad NUMBER(3);
    v_min_fecha_contrato DATE;
BEGIN
    -- Limpiamos las tablas antes de procesar
    EXECUTE IMMEDIATE 'TRUNCATE TABLE BDY1102_ET_FA_MACEVEDO.DETALLE_PUNTAJE_POSTULACION';
    EXECUTE IMMEDIATE 'TRUNCATE TABLE BDY1102_ET_FA_MACEVEDO.RESULTADO_POSTULACION';

    -- Recorremos cada postulante
    FOR r IN c_postulantes LOOP
        v_nombre_completo := r.apaterno || ' ' || r.amaterno || ' ' || r.pnombre;
        
        -- Regla 1.1: Puntaje por pueblo indigena
        IF r.cod_pueblo_ind IS NOT NULL THEN
            SELECT ptje_pueblo_ind INTO v_ptje_indigena FROM BDY1102_ET_FA_MACEVEDO.PTJE_PUEBLO_INDIGENA WHERE cod_pueblo_ind = r.cod_pueblo_ind;
        ELSE
            v_ptje_indigena := 0;
        END IF;

        -- Regla 1.2: Sacamos el contrato mas antiguo para la experiencia
        SELECT MIN(fecha_contrato) INTO v_min_fecha_contrato FROM BDY1102_ET_FA_MACEVEDO.ANTECEDENTES_LABORALES WHERE numrun = r.numrun;
        v_anios_exp := ROUND(MONTHS_BETWEEN(SYSDATE, v_min_fecha_contrato) / 12);
        
        SELECT ptje_experiencia INTO v_ptje_exp 
        FROM BDY1102_ET_FA_MACEVEDO.PTJE_ANNOS_EXPERIENCIA 
        WHERE v_anios_exp BETWEEN rango_annos_ini AND rango_annos_ter;

        -- Regla 1.3: Puntaje por el pais de postulación
        SELECT i.cod_pais INTO v_cod_pais
        FROM BDY1102_ET_FA_MACEVEDO.PASANTIA_PERFECCIONAMIENTO pp
        JOIN BDY1102_ET_FA_MACEVEDO.INSTITUCION i ON pp.cod_inst = i.cod_inst
        WHERE pp.cod_programa = r.cod_programa;
        
        SELECT ptje_pais INTO v_ptje_pais FROM BDY1102_ET_FA_MACEVEDO.PTJE_PAIS_POSTULA WHERE cod_pais = v_cod_pais;

        -- Regla 1.4: Calculamos edad y damos 15% extra si tiene mas de 55
        v_edad := ROUND(MONTHS_BETWEEN(SYSDATE, r.fecha_nacimiento) / 12);
        IF v_edad > 55 THEN
            v_ptje_extra := ROUND((v_ptje_indigena + v_ptje_exp + v_ptje_pais) * 0.15);
        ELSE
            v_ptje_extra := 0;
        END IF;

        -- Sumamos todo
        v_ptje_final := ROUND(v_ptje_indigena + v_ptje_exp + v_ptje_pais + v_ptje_extra);

        -- Vemos si cumple para quedar seleccionado (mayor o igual a 2400)
        IF v_ptje_final >= 2400 THEN
            v_resultado := 'SELECCIONADO';
        ELSE
            v_resultado := 'NO SELECCIONADO';
        END IF;

        -- Insertamos el detalle y el resultado en las tablas correspondientes
        INSERT INTO BDY1102_ET_FA_MACEVEDO.DETALLE_PUNTAJE_POSTULACION 
        VALUES (TO_CHAR(r.numrun), v_nombre_completo, v_ptje_indigena, v_ptje_exp, v_ptje_pais, v_ptje_extra);
        
        INSERT INTO BDY1102_ET_FA_MACEVEDO.RESULTADO_POSTULACION 
        VALUES (TO_CHAR(r.numrun), v_ptje_final, v_resultado);
    END LOOP;
    COMMIT;
END;
/


-- Requerimiento 4.2: Informe final para ver los que pasaron el promedio
SELECT 
    d.run_postulante AS "RUN POSTULANTE",
    d.nombre_postulante AS "NOMBRE_POSTULANTE",
    d.ptje_pueblo_indigena AS "PTJE PUEBLO_INDIGENA",
    d.ptje_annos_exp AS "PTJE ANNOS_EXP",
    d.ptje_pais_postula AS "PTJE_PAIS_POSTULA",
    d.ptje_extra AS "PTJE EXTRA",
    r.ptje_final_post AS "PTJE FINAL POST",
    r.resultado_post AS "RESULTADO POST"
FROM BDY1102_ET_FA_MACEVEDO.DETALLE_PUNTAJE_POSTULACION d
JOIN BDY1102_ET_FA_MACEVEDO.RESULTADO_POSTULACION r ON d.run_postulante = r.run_postulante
WHERE r.ptje_final_post > (SELECT AVG(ptje_final_post) FROM BDY1102_ET_FA_MACEVEDO.RESULTADO_POSTULACION)
ORDER BY r.ptje_final_post DESC;