module.exports = [
    `create table test_bulk_insert
    (   num number
    ,   str varchar2(100)
    )`,

    `create or replace package p_test_bulk_insert as
    procedure Add( iNum in number
                 , iStr in varchar2
                 , oStatus out number
                 , oTxt    out varchar2
                 );
    end p_test_bulk_insert;`,

    `create or replace package body p_test_bulk_insert as
    procedure Add( iNum in number
                 , iStr in varchar2
                 , oStatus out number
                 , oTxt    out varchar2
                 ) is
    pragma autonomous_transaction;
    begin
        insert into test_bulk_insert values (iNum, iStr);
        commit;
        oStatus := 0;
        oTxt := 'Ok';
    end Add;
    end p_test_bulk_insert;`,
];