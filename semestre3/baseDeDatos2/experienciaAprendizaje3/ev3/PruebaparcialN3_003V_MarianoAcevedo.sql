DECLARE
    CURSOR c_equipos IS
        SELECT
            cod_equipo,
            descripcion,
            id_tipo_equipo,
            valor_arriendo_dia
        FROM EQUIPO_CAMPING
        ORDER BY cod_equipo;
    
    v_cod_equipo      EQUIPO_CAMPING.cod_equipo%TYPE;
    v_descripcion     EQUIPO_CAMPING.descripcion%TYPE;
    v_id_tipo         EQUIPO_CAMPING.id_tipo_equipo%TYPE;
    v_valor_dia       EQUIPO_CAMPING.valor_arriendo_dia%TYPE;
    
    v_costo_diario    COSTO_MANTENCION.costo_dia%TYPE;
    v_cant_arriendos  NUMBER(5);
    v_total_dias      NUMBER(6);
    
    v_ingreso         NUMBER(12);
    v_costo_mant      NUMBER(12);
    v_utilidad        NUMBER(12);
    v_margen          NUMBER(5);
    v_clasificacion   VARCHAR2(15);
    
BEGIN
    EXECUTE IMMEDIATE 'TRUNCATE TABLE EQUIPO_RENTABILIDAD';
    
    OPEN c_equipos;
    LOOP
        FETCH c_equipos INTO v_cod_equipo, v_descripcion, v_id_tipo, v_valor_dia;
        EXIT WHEN c_equipos%NOTFOUND;

        SELECT costo_dia
        INTO v_costo_diario
        FROM COSTO_MANTENCION
        WHERE id_tipo_equipo = v_id_tipo;

        SELECT 
            COUNT(id_arriendo), 
            NVL(SUM(dias_solicitados), 0)
        INTO v_cant_arriendos, v_total_dias
        FROM ARRIENDO_EQUIPO_CAMPING
        WHERE cod_equipo = v_cod_equipo
            AND EXTRACT(YEAR FROM fecha_ini_arriendo) = 2026;

        v_ingreso    := v_valor_dia * v_total_dias;
        v_costo_mant := v_total_dias * v_costo_diario;
        v_utilidad   := v_ingreso - v_costo_mant;

        IF v_ingreso > 0 THEN
            v_margen := ROUND((v_utilidad / v_ingreso) * 100);
        ELSE
            v_margen := 0;
        END IF;

        IF v_utilidad >= 300000 THEN
            v_clasificacion := 'Alta';
        ELSIF v_utilidad >= 100000 THEN
            v_clasificacion := 'Media';
        ELSIF v_utilidad > 0 THEN
            v_clasificacion := 'Baja';
        ELSE
            v_clasificacion := 'Sin movimiento';
        END IF;

        INSERT INTO EQUIPO_RENTABILIDAD (
            cod_equipo, anno_proceso, id_tipo_equipo, descripcion,
            cantidad_arriendos, total_dias, ingreso_arriendo,
            costo_mantencion, utilidad, margen_pct, clasificacion
        ) VALUES (
            v_cod_equipo, 2026, v_id_tipo, v_descripcion,
            v_cant_arriendos, v_total_dias, v_ingreso,
            v_costo_mant, v_utilidad, v_margen, v_clasificacion
        );

    END LOOP;
    CLOSE c_equipos;
    
    COMMIT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        --
        DBMS_OUTPUT.PUT_LINE('Query no encontró Datos. El proceso se detuvo');
        --
    WHEN TOO_MANY_ROWS THEN
        --
        DBMS_OUTPUT.PUT_LINE('Query está seleccionado mas de una fila. El proceso se detuvo');
        --
    WHEN OTHERS THEN
        --
        DBMS_OUTPUT.PUT_LINE('ERROR INESPERADO: ' || SQLERRM);
        --
END;

SELECT * FROM EQUIPO_RENTABILIDAD;