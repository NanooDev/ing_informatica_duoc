DECLARE
   --
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
   --      
BEGIN
   -- Impresión de títulos
   --
   DBMS_OUTPUT.PUT_LINE('         << LISTADO DE CLIENTES >>');
   DBMS_OUTPUT.PUT_LINE('                            ');
   --
   FOR c_cliente IN r_cliente LOOP
      --
      --Sección de impresión de datos     
      DBMS_OUTPUT.PUT_LINE('Rut      : [' || c_cliente.RutCliente                       || ']');
      DBMS_OUTPUT.PUT_LINE('Nombre   : [' || c_cliente.Nombre                           || ']');
      DBMS_OUTPUT.PUT_LINE('Dirección: [' || c_cliente.Direccion                        || ']');
      DBMS_OUTPUT.PUT_LINE('Comuna   : [' || c_cliente.CodComuna                        || ']');
      DBMS_OUTPUT.PUT_LINE('Teléfono : [' || c_cliente.Telefono                         || ']');
      DBMS_OUTPUT.PUT_LINE('Estado   : [' || c_cliente.Estado                           || ']');
      DBMS_OUTPUT.PUT_LINE('Mail     : [' || c_cliente.Mail                             || ']');
      DBMS_OUTPUT.PUT_LINE('Crédito  : [' || TO_CHAR(c_cliente.Credito,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('Saldo    : [' || TO_CHAR(c_cliente.Saldo  ,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('-------------------------------------');
      --  
   END LOOP;
   --
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
/