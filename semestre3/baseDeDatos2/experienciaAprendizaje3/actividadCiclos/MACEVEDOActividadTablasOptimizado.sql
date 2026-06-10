DECLARE
   -- Declaracion de variables
   v_num_tablas   NUMBER := &Total_de_tablas_a_crear;
   v_max_multi    NUMBER := &Hasta_que_numero_multiplicar;
   v_columnas     NUMBER := &Cuantas_columnas_quieres_ver;
   
   v_tabla_actual NUMBER := 1;
   v_linea        VARCHAR2(4000);
   v_separador    VARCHAR2(200) := '---------------------------------------------------------------------------------';
BEGIN
   WHILE v_tabla_actual <= v_num_tablas LOOP
       
       DBMS_OUTPUT.PUT_LINE(v_separador);
       v_linea := '';
       
       -- Bucle para armar los titulos de las columnas hacia el lado
       FOR i IN 0 .. (v_columnas - 1) LOOP
           IF (v_tabla_actual + i) <= v_num_tablas THEN
               v_linea := v_linea || 'Tabla ' || TO_CHAR(v_tabla_actual + i, '99') || '           ';
           END IF;
       END LOOP;
       DBMS_OUTPUT.PUT_LINE(v_linea);
       DBMS_OUTPUT.PUT_LINE(v_separador);

       FOR Fila IN 1 .. v_max_multi LOOP
           v_linea := ''; 
           
           FOR i IN 0 .. (v_columnas - 1) LOOP
               IF (v_tabla_actual + i) <= v_num_tablas THEN
                   v_linea := v_linea || TO_CHAR(v_tabla_actual + i, '99') || ' x' || 
                                         TO_CHAR(Fila, '99') || ' =' || 
                                         TO_CHAR((v_tabla_actual + i) * Fila, '99') || '      ';
               END IF;
           END LOOP;
           
           DBMS_OUTPUT.PUT_LINE(v_linea);------------------------------------------------------------
       END LOOP;
       
       DBMS_OUTPUT.PUT_LINE(' ');

       v_tabla_actual := v_tabla_actual + v_columnas;
       
   END LOOP;
   --
END;