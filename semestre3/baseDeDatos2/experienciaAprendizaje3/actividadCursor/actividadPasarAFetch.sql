DECLARE
   v_rut       VARCHAR2(10);
   v_nombre    VARCHAR2(30);
   v_direccion VARCHAR2(30);
   v_comuna    NUMBER(2,0);
   v_telefono  NUMBER(10,0);
   v_estado    VARCHAR2(1);
   v_mail      VARCHAR2(50);
   v_credito   NUMBER(7,0);
   v_saldo     NUMBER(7,0);

   CURSOR r_cliente IS
      SELECT c.RUTCLIENTE,
             c.NOMBRE,
             c.DIRECCION,
             c.CODCOMUNA,
             c.TELEFONO,
             c.ESTADO,
             c.MAIL,
             c.CREDITO,
             c.SALDO
        FROM CLIENTE c;
        
BEGIN
   DBMS_OUTPUT.PUT_LINE('<< LISTADO DE CLIENTES >>');
   DBMS_OUTPUT.PUT_LINE('                         ');

   OPEN r_cliente;

   LOOP
      
      FETCH r_cliente INTO v_rut, v_nombre, v_direccion, v_comuna, v_telefono, v_estado, v_mail, v_credito, v_saldo;
      EXIT WHEN r_cliente%NOTFOUND;

      DBMS_OUTPUT.PUT_LINE('Rut      : [' || v_rut || ']');
      DBMS_OUTPUT.PUT_LINE('Nombre   : [' || v_nombre || ']');
      DBMS_OUTPUT.PUT_LINE('Dirección: [' || v_direccion || ']');
      DBMS_OUTPUT.PUT_LINE('Comuna   : [' || v_comuna || ']');
      DBMS_OUTPUT.PUT_LINE('Teléfono : [' || v_telefono || ']');
      DBMS_OUTPUT.PUT_LINE('Estado   : [' || v_estado || ']');
      DBMS_OUTPUT.PUT_LINE('Mail     : [' || v_mail || ']');
      DBMS_OUTPUT.PUT_LINE('Crédito  : [' || TO_CHAR(v_credito,'$999G999G999') || ']');
      DBMS_OUTPUT.PUT_LINE('Saldo    : [' || TO_CHAR(v_saldo ,'$999G999G999') || ']');
      DBMS_OUTPUT.PUT_LINE('-------------------------------------');
      
   END LOOP;

   CLOSE r_cliente;

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