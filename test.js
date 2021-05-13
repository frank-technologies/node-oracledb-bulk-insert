const oracle = require('oracledb');

const dbUp = require('./db-up');
const dbDown = require('./db-down');

const env = process.env;

const dbParams = {
    user:          env.DB_USER,
    password:      env.DB_PASSWORD,
    connectString: env.DB_CONNECT,
};

(async() => {
    const connection = await oracle.getConnection(dbParams);

    for (const stmt of dbDown) {
        try {
            await connection.execute(stmt);
        } catch (e) {
        }
    }
    for (const stmt of dbUp) {
        await connection.execute(stmt);
    }

    const rows = [];
    for (let i = 0; i < 1000; i++) {
        rows.push({
            num: i,
            str: `str ${i}`,
        });
    }

    console.time('time 1');
    const binds1 = {
        num: { type: oracle.NUMBER },
        str: { type: oracle.STRING, maxSize: 10 },
        status: { dir: oracle.BIND_OUT, type: oracle.NUMBER },
        txt:    { dir: oracle.BIND_OUT, type: oracle.STRING, maxSize: 100 },
    };
    await connection.executeMany(`
        begin
            p_test_bulk_insert.Add(
                iNum => :num,
                iStr => :str,
                oStatus => :status,
                oTxt => :txt
            );
        end;
        `,
        rows,
        {
            bindDefs: binds1,
        },
    );
    console.timeEnd('time 1');

    console.time('time 2');
    const binds2 = {
        num: { type: oracle.NUMBER },
        str: { type: oracle.STRING, maxSize: 10 },
    };
    await connection.executeMany(`
        declare
            xStatus number;
            xTxt varchar2(100);
        begin
            p_test_bulk_insert.Add(iNum => :num, iStr => :str, oStatus => xStatus, oTxt => xTxt);
            if (xStatus != 0) then
                raise_application_error(-20000, 'Статус: ' || xStatus || '; сообщение: ' || xTxt);
            end if;
        end;
        `,
        rows,
        {
            bindDefs: binds2,
        },
    );
    console.timeEnd('time 2');

    for (const stmt of dbDown) {
        await connection.execute(stmt);
    }
})().catch((err) => {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
});