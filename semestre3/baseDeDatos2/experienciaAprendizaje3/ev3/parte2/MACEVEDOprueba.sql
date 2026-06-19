DECLARE
    -- 1. CURSOR EXPLÍCITO SIN PARÁMETROS: Trae SÓLO los datos básicos del tipo de equipo
    CURSOR c_tipos IS
        SELECT id_tipo_equipo, nombre_tipo_equipo
        FROM TIPO_EQUIPO
        ORDER BY id_tipo_equipo;

    -- Variables para el cursor
    v_id_tipo        TIPO_EQUIPO.id_tipo_equipo%TYPE;
    v_nombre_tipo    TIPO_EQUIPO.nombre_tipo_equipo%TYPE;

    -- Variables para extraer datos de los SELECT separados
    v_costo_diario   COSTO_MANTENCION.costo_dia%TYPE;
    v_cant_equipos   NUMBER(5);
    v_tot_arriendos  NUMBER(6);
    v_tot_dias       NUMBER(6);
    v_tot_ingreso    NUMBER(14);

    -- Variables para los cálculos internos PL/SQL
    v_tot_costo      NUMBER(14);
    v_tot_utilidad   NUMBER(14);
    v_margen_prom    NUMBER(5);
    v_clasificacion  VARCHAR2(15);

BEGIN
    -- 2. TRUNCAR LA TABLA EN TIEMPO DE EJECUCIÓN
    EXECUTE IMMEDIATE 'TRUNCATE TABLE RENTABILIDAD_POR_TIPO';

    -- 3. Iniciamos el recorrido del cursor
    OPEN c_tipos;
    LOOP
        FETCH c_tipos INTO v_id_tipo, v_nombre_tipo;
        EXIT WHEN c_tipos%NOTFOUND;

        -- 4. SELECT SEPARADO 1: Obtener el costo diario de mantención
        SELECT costo_dia
          INTO v_costo_diario
          FROM COSTO_MANTENCION
         WHERE id_tipo_equipo = v_id_tipo;

        -- 5. SELECT SEPARADO 2: Contar cuántos equipos físicos existen de este tipo
        SELECT COUNT(cod_equipo)
          INTO v_cant_equipos
          FROM EQUIPO_CAMPING
         WHERE id_tipo_equipo = v_id_tipo;

        -- 6. SELECT SEPARADO 3: Obtener estadísticas de arriendos e ingresos del año 2026
        -- Usamos INNER JOIN para cruzar el equipo con el arriendo
        SELECT NVL(COUNT(a.id_arriendo), 0),
               NVL(SUM(a.dias_solicitados), 0),
               NVL(SUM(e.valor_arriendo_dia * a.dias_solicitados), 0)
          INTO v_tot_arriendos, 
               v_tot_dias, 
               v_tot_ingreso
          FROM EQUIPO_CAMPING e
          JOIN ARRIENDO_EQUIPO_CAMPING a 
            ON e.cod_equipo = a.cod_equipo
         WHERE e.id_tipo_equipo = v_id_tipo
           AND EXTRACT(YEAR FROM a.fecha_ini_arriendo) = 2026;

        -- 7. CÁLCULOS MATEMÁTICOS EN PL/SQL
        v_tot_costo    := v_tot_dias * v_costo_diario;
        v_tot_utilidad := v_tot_ingreso - v_tot_costo;

        -- Controlamos el margen para no dividir por cero si un tipo no tuvo arriendos
        IF v_tot_ingreso > 0 THEN
            v_margen_prom := ROUND((v_tot_utilidad / v_tot_ingreso) * 100);
        ELSE
            v_margen_prom := 0;
        END IF;

        -- 8. CLASIFICACIÓN (Nuevos Rangos de la Parte 2)
        IF v_tot_utilidad >= 1500000 THEN
            v_clasificacion := 'Alta';
        ELSIF v_tot_utilidad >= 500000 THEN
            v_clasificacion := 'Media';
        ELSIF v_tot_utilidad > 0 THEN
            v_clasificacion := 'Baja';
        ELSE
            v_clasificacion := 'Sin movimiento';
        END IF;

        -- 9. INSERCIÓN DE RESULTADOS
        INSERT INTO RENTABILIDAD_POR_TIPO (
            id_tipo_equipo, anno_proceso, nombre_tipo,
            cantidad_equipos, total_arriendos, total_ingreso,
            total_costo, total_utilidad, margen_promedio, clasificacion
        ) VALUES (
            v_id_tipo, 2026, v_nombre_tipo,
            v_cant_equipos, v_tot_arriendos, v_tot_ingreso,
            v_tot_costo, v_tot_utilidad, v_margen_prom, v_clasificacion
        );

    END LOOP;
    CLOSE c_tipos;

    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Consolidado de Rentabilidad 2026 finalizado con éxito.');
END;

SELECT * FROM RENTABILIDAD_POR_TIPO ORDER BY total_utilidad DESC;