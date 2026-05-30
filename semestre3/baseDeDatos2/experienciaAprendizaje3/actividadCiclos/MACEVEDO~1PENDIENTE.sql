DECLARE
    --v_num_multi Number(10) := 0;
    --v_resultado Number(10) := 0;
    v_x Number(10) := 0;
BEGIN
    FOR i IN 1 .. 6 LOOP
        DBMS_OUTPUT.PUT_LINE('TABLA DEL '||i);
        FOR x IN 1 .. 10 LOOP
            DBMS_OUTPUT.PUT_LINE(i || ' x ' || v_x || ' = ' || i * v_x);
        END_LOOP
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