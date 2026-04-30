-- REQUERIMIENTO 3
SELECT
    TO_CHAR(e.NUMRUN_EMP, '99G999G999') || '-' ||
    e.DVRUN_EMP RUN_EMPLEADO,
    e.PNOMBRE_EMP || ' ' ||
    e.APPATERNO_EMP NOMBRE_EMPLEADO,
    '$' || TO_CHAR(e.SUELDO_BASE, '9G999G999') SUELDO_EMPLEADO,
    ec.NOMBRE_ESTADO_CIVIL ESTADO_CIVIL,
    CASE
        WHEN ec.NOMBRE_ESTADO_CIVIL IN ('CASADO', 'ACUERDO DE UNION CIVIL') 
            THEN 'Cumple requisitos'
        ELSE 'No cumple requisitos'
    END RESOLUCION_BENEFICIO,
    '$' || TO_CHAR( CASE
                        WHEN ec.NOMBRE_ESTADO_CIVIL IN ('CASADO', 'ACUERDO DE UNION CIVIL') 
                            THEN
                                CASE
                                    WHEN ce.DESC_CATEGORIA_EMP IN ('Mecánico', 'Auxiliar')
                                        THEN e.SUELDO_BASE * 1.20
                                    WHEN ce.DESC_CATEGORIA_EMP = 'Encargado Arriendo'
                                        THEN e.SUELDO_BASE * 1.10
                                    ELSE e.SUELDO_BASE
                                END
                            ELSE e.SUELDO_BASE
                        END, '99G999G999') SUELDO_FINAL_CON_BONO
FROM EMPLEADO e
    JOIN ESTADO_CIVIL ec ON (e.ID_ESTADO_CIVIL = ec.ID_ESTADO_CIVIL)
    JOIN CATEGORIA_EMPLEADO ce ON (e.ID_CATEGORIA_EMP = ce.ID_CATEGORIA_EMP)
WHERE ce.DESC_CATEGORIA_EMP IN ('Mecánico', 'Auxiliar', 'Encargado Arriendo')
ORDER BY NOMBRE_EMPLEADO ASC;