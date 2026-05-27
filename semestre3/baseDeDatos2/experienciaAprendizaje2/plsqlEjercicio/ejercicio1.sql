DECLARE
    --
    RUT           VARCHAR2(10);
    NOMBRE        VARCHAR2(30);
    DIRECCION     VARCHAR2(30);
    ID_COMUNA    NUMBER(2,0);
    NOM_COMUNA    VARCHAR2(30);
    TELEFONO      NUMBER(10,0);
    ESTADO        VARCHAR2(1);
    MAIL          VARCHAR2(50);
    CREDITO       NUMBER(7,0);
    SALDO         NUMBER(7,0);
    --
    --
    BUSCAR_RUT    VARCHAR2(10) := '6245678-1'; 
    --
BEGIN
    --
    SELECT
        --
        cli.RUTCLIENTE,
        cli.NOMBRE,
        cli.DIRECCION,
        co.CODCOMUNA,
        co.DESCRIPCION,
        cli.TELEFONO,
        cli.ESTADO,
        cli.MAIL,
        cli.CREDITO,
        cli.SALDO
        --
      --
      INTO
        --
        RUT,
        NOMBRE,
        DIRECCION,
        ID_COMUNA,
        NOM_COMUNA,
        TELEFONO,
        ESTADO,
        MAIL,
        CREDITO,
        SALDO
        --
      FROM CLIENTE cli 
      JOIN COMUNA co ON (cli.codcomuna = co.codcomuna)
      WHERE cli.RUTCLIENTE = BUSCAR_RUT;
      --
        
    DBMS_OUTPUT.PUT_LINE('DATOS DEL CLIENTE');
    DBMS_OUTPUT.PUT_LINE('Rut Cliente: ' || RUT);
    DBMS_OUTPUT.PUT_LINE('Nombre Cliente: ' || NOMBRE);
    DBMS_OUTPUT.PUT_LINE('Dirección: ' || DIRECCION);
    DBMS_OUTPUT.PUT_LINE('Código Comuna: ' || ID_COMUNA);
    DBMS_OUTPUT.PUT_LINE('Nombre Comuna: ' || NOM_COMUNA);
    DBMS_OUTPUT.PUT_LINE('Teléfono: ' || TELEFONO);
    DBMS_OUTPUT.PUT_LINE('Estado: ' || ESTADO);
    DBMS_OUTPUT.PUT_LINE('Mail: ' || MAIL);
    DBMS_OUTPUT.PUT_LINE('Crédito: ' || CREDITO);
    DBMS_OUTPUT.PUT_LINE('Saldo: ' || SALDO);

EXCEPTION
    --
    WHEN OTHERS THEN
        --
        DBMS_OUTPUT.PUT_LINE('Error inesperado: ' || SQLERRM);
        --
    --
END;