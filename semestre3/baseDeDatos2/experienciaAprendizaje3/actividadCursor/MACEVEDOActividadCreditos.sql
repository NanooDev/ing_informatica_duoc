--- FORMA DE MARIANO
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
   -- VARIABLE PARA BUSCAR EL NOMBRE DE LAS COMUNAS
   Nombre_Comuna COMUNA.DESCRIPCION%TYPE;
   -- VARIABLE PARA CONTAR LOS CLIENTES PROCESADOS
   cont_cli Number(10) := 0;
   -- VARIABLES PARA CONTAR CUANTOS CLIENTES HAY 
   cont_rango1 Number(10) := 0;
   cont_rango2 Number(10) := 0;
   cont_rango3 Number(10) := 0;
   cont_rango4 Number(10) := 0;
   --
BEGIN
   -- Impresión de títulos
   --
   DBMS_OUTPUT.PUT_LINE('         << LISTADO DE CLIENTES >>');
   DBMS_OUTPUT.PUT_LINE('                            ');
   --
      FOR c_cliente IN r_cliente LOOP
      -- CONTROLANDO LA EXCEPCION DE QUE UNA COMUNA NO EXISTE PARA QUE EL PROGRAMA NO SE DETENGA
      BEGIN
        --
        SELECT co.DESCRIPCION
        INTO Nombre_Comuna
        FROM COMUNA co
        WHERE co.CODCOMUNA = c_cliente.codcomuna;
        --
      EXCEPTION
        WHEN NO_DATA_FOUND THEN
            --
            Nombre_Comuna := 'Comuna No Existe';
            --
      END;
      --
      --Sección de impresión de datos     
      DBMS_OUTPUT.PUT_LINE('Rut      : [' || c_cliente.RutCliente                       || ']');
      DBMS_OUTPUT.PUT_LINE('Nombre   : [' || c_cliente.Nombre                           || ']');
      DBMS_OUTPUT.PUT_LINE('Dirección: [' || c_cliente.Direccion                        || ']');
      DBMS_OUTPUT.PUT_LINE('Comuna   : [' || c_cliente.CodComuna || ' ' || 
                                             Nombre_Comuna                              || ']');
      DBMS_OUTPUT.PUT_LINE('Teléfono : [' || c_cliente.Telefono                         || ']');
      DBMS_OUTPUT.PUT_LINE('Estado   : [' || c_cliente.Estado                           || ']');
      DBMS_OUTPUT.PUT_LINE('Mail     : [' || c_cliente.Mail                             || ']');
      DBMS_OUTPUT.PUT_LINE('Crédito  : [' || TO_CHAR(c_cliente.Credito,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('Saldo    : [' || TO_CHAR(c_cliente.Saldo  ,'$999G999G999')  || ']');
      DBMS_OUTPUT.PUT_LINE('-------------------------------------');
      cont_cli := cont_cli + 1;
      IF c_cliente.Credito between 0 and 999999 then
        cont_rango1 := cont_rango1 + 1;
      ELSIF c_cliente.Credito between 1000000 and 1999999 then
        cont_rango2 := cont_rango2 + 1;
      ELSIF c_cliente.Credito between 2000000 and 2499999 then
        cont_rango3 := cont_rango3 + 1;
      ELSE
        cont_rango4 := cont_rango4 + 1;
      END IF;
        
      --  
   END LOOP;
   --
   DBMS_OUTPUT.PUT_LINE('Total Clientes Registrados: '|| cont_cli);
   --
   --
   DBMS_OUTPUT.PUT_LINE('Total Clientes Rango de Credito 1: '|| cont_rango1);
   DBMS_OUTPUT.PUT_LINE('Total Clientes Rango de Credito 2: '|| cont_rango2);
   DBMS_OUTPUT.PUT_LINE('Total Clientes Rango de Credito 3: '|| cont_rango3);
   DBMS_OUTPUT.PUT_LINE('Total Clientes Rango de Credito 4: '|| cont_rango4);
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