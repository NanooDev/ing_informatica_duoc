DECLARE

   CURSOR r_cliente IS
      SELECT c.RUTCLIENTE    
            ,c.NOMBRE
            ,c.DIRECCION
            ,c.CODCOMUNA
            ,c.TELEFONO
            ,c.ESTADO
            ,c.MAIL
            ,c.CREDITO
            ,c.SALDO
            FROM CLIENTE c;
            
    cont_clientes NUMBER(10) := 0;
    cont_rango0 NUMBER(10) := 0;
    cont_rango1 NUMBER(10) := 0;
    cont_rango2 NUMBER(10) := 0;
    cont_rango3 NUMBER(10) := 0;
    cont_rango4 NUMBER(10) := 0;
    v_nombre_comuna COMUNA.DESCRIPCION%TYPE;
BEGIN
   DBMS_OUTPUT.PUT_LINE('         << LISTADO DE CLIENTES >>');
   DBMS_OUTPUT.PUT_LINE('                            ');
   
   FOR c_cliente IN r_cliente LOOP
   
      BEGIN 
         SELECT DESCRIPCION 
         INTO v_nombre_comuna
         FROM COMUNA
         WHERE CODCOMUNA = c_cliente.CodComuna;
      EXCEPTION
         WHEN NO_DATA_FOUND THEN
            v_nombre_comuna := 'Comuna no registrada';
      END;
      
      --SELECT co.DESCRIPCION
      --INTO Nombre_Comuna
      --FROM COMUNA co
      --WHERE co.CODCOMUNA = c_cliente.codcomuna;
       
      DBMS_OUTPUT.PUT_LINE('Rut      : [' || c_cliente.RutCliente                      || ']');
      DBMS_OUTPUT.PUT_LINE('Nombre   : [' || c_cliente.Nombre                          || ']');
      DBMS_OUTPUT.PUT_LINE('Dirección: [' || c_cliente.Direccion                       || ']');
      DBMS_OUTPUT.PUT_LINE('Comuna  : [(' || c_cliente.CodComuna || ') ' || v_nombre_comuna || ']');
      DBMS_OUTPUT.PUT_LINE('Teléfono : [' || c_cliente.Telefono                        || ']');
      DBMS_OUTPUT.PUT_LINE('Estado   : [' || c_cliente.Estado                          || ']');
      DBMS_OUTPUT.PUT_LINE('Mail     : [' || c_cliente.Mail                            || ']');
      DBMS_OUTPUT.PUT_LINE('Crédito  : [' || TO_CHAR(c_cliente.Credito,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('Saldo    : [' || TO_CHAR(c_cliente.Saldo  ,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('-------------------------------------');
      
      cont_clientes := cont_clientes + 1;
      IF c_cliente.credito < 299999 THEN
            cont_rango0 := cont_rango0 + 1;
      ELSIF c_cliente.credito BETWEEN 300000 AND 999999 THEN
            cont_rango1 := cont_rango1 + 1;
      ELSIF c_cliente.credito BETWEEN 1000000 AND 1999999 THEN
            cont_rango2 := cont_rango2 + 1;
      ELSIF c_cliente.credito BETWEEN 2000000 AND 2499999 THEN
            cont_rango3 := cont_rango3 + 1;
      ELSIF c_cliente.credito >= 2500000 THEN
            cont_rango4 := cont_rango4 + 1;
      END IF;
      
   END LOOP;
   
   DBMS_OUTPUT.PUT_LINE('Total de clientes: [' || cont_clientes || ']');
   DBMS_OUTPUT.PUT_LINE('Clientes rango 0 (menos de 299999): [' || cont_rango0 || ']');
   DBMS_OUTPUT.PUT_LINE('Clientes rango 1 (300000 - 999999): [' || cont_rango1 || ']');
   DBMS_OUTPUT.PUT_LINE('Clientes rango 2 (1000000 - 1999999): [' || cont_rango2 || ']');
   DBMS_OUTPUT.PUT_LINE('Clientes rango 3 (2000000 - 2499999): [' || cont_rango3 || ']');
   DBMS_OUTPUT.PUT_LINE('Clientes rango 4 (2500000 o mas): [' || cont_rango4 || ']');
   
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