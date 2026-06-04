DECLARE
    v_linea VARCHAR2(200);
BEGIN
    DBMS_OUTPUT.PUT_LINE('TABLA DEL 1          TABLA DEL 2          TABLA DEL 3');
    
    FOR x IN 1 .. 10 LOOP
        v_linea := ''; --Limpiar fila 
        
        FOR i IN 1 .. 3 LOOP
            
            v_linea := v_linea || i || ' x ' || x || ' = ' || (i * x) || '             ';
        END LOOP;
        
        DBMS_OUTPUT.PUT_LINE(v_linea);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(' '); --Separador
    
    
    DBMS_OUTPUT.PUT_LINE('TABLA DEL 4          TABLA DEL 5          TABLA DEL 6');
    
    FOR x IN 1 .. 10 LOOP
        v_linea := ''; 
        
        FOR i IN 4 .. 6 LOOP
            v_linea := v_linea || i || ' x ' || x || ' = ' || (i * x) || '             ';
        END LOOP;
        
        DBMS_OUTPUT.PUT_LINE(v_linea);
    END LOOP;
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
END;