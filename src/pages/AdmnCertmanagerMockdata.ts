export const intermediatemockdata = [
    {
        "id": 1,
        "root_ca_id": 3,
        "common_name": "Acme Corporation Intermediate CA",
        "key_length": 2048,
        "valid_from": "2025-11-06T22:41:40.033233",
        "valid_until": "2030-11-05T22:41:40.033233",
        "serial_number": "4994379141302451626",
        "is_active": true,
        "created_at": "2025-11-06T22:41:40.037650"
    },
    {
        "id": 2,
        "root_ca_id": 6,
        "common_name": "string",
        "key_length": 2048,
        "valid_from": "2025-11-07T20:47:45.471885",
        "valid_until": "2040-11-03T20:47:45.471885",
        "serial_number": "16778722553871774477",
        "is_active": true,
        "created_at": "2025-11-07T20:47:45.476273"
    },
    {
        "id": 3,
        "root_ca_id": 11,
        "common_name": "Testing Vpn",
        "key_length": 2048,
        "valid_from": "2025-11-11T11:48:32.013305",
        "valid_until": "2028-11-10T11:48:32.013305",
        "serial_number": "15763023027614208435",
        "is_active": true,
        "created_at": "2025-11-11T11:48:32.016445"
    },
    {
        "id": 4,
        "root_ca_id": 11,
        "common_name": "Testing Vpn",
        "key_length": 2048,
        "valid_from": "2025-11-11T13:58:10.592856",
        "valid_until": "2028-11-10T13:58:10.592856",
        "serial_number": "414777907911654799",
        "is_active": true,
        "created_at": "2025-11-11T13:58:10.596297"
    },
    {
        "id": 5,
        "root_ca_id": 11,
        "common_name": "Testing Vpn",
        "key_length": 2048,
        "valid_from": "2025-11-12T12:33:32.918565",
        "valid_until": "2028-11-11T12:33:32.918565",
        "serial_number": "6022716513441660464",
        "is_active": true,
        "created_at": "2025-11-12T12:33:32.921774"
    },
    {
        "id": 6,
        "root_ca_id": 11,
        "common_name": "Testing Vpn",
        "key_length": 2048,
        "valid_from": "2025-11-14T15:04:07.778774",
        "valid_until": "2028-11-13T15:04:07.778774",
        "serial_number": "3122604181276642890",
        "is_active": true,
        "created_at": "2025-11-14T15:04:07.782553"
    },
    {
        "id": 7,
        "root_ca_id": 11,
        "common_name": "Testing Vpn",
        "key_length": 2048,
        "valid_from": "2025-11-14T15:05:08.614218",
        "valid_until": "2028-11-13T15:05:08.614218",
        "serial_number": "6434876828805156834",
        "is_active": true,
        "created_at": "2025-11-14T15:05:08.617094"
    }
]

export const issuedcertsmockdata
    = [
        {
            "id": 2,
            "intermediate_ca_id": 1,
            "common_name": "vpn.acme.com",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.453143",
            "valid_until": "2027-11-06T22:41:40.453143",
            "serial_number": "349187585951979826",
            "is_active": true,
            "created_at": "2025-11-06T22:41:40.454993"
        },
        {
            "id": 1,
            "intermediate_ca_id": 1,
            "common_name": "john.doe@acme.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.253605",
            "valid_until": "2026-11-06T22:41:40.253605",
            "serial_number": "7372327794352391371",
            "is_active": false,
            "created_at": "2025-11-06T22:41:40.257400"
        },
        {
            "id": 3,
            "intermediate_ca_id": 1,
            "common_name": "user@example.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-07T14:26:30.283207",
            "valid_until": "2026-11-07T14:26:30.283207",
            "serial_number": "1756264145815151120",
            "is_active": true,
            "created_at": "2025-11-07T14:26:30.290184"
        },
        {
            "id": 4,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T10:55:02.564116",
            "valid_until": "2026-11-14T10:55:02.564116",
            "serial_number": "4540243803565873181",
            "is_active": true,
            "created_at": "2025-11-14T10:55:02.567685"
        },
        {
            "id": 5,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:23.726510",
            "valid_until": "2026-11-14T12:00:23.726510",
            "serial_number": "9703584742982487789",
            "is_active": true,
            "created_at": "2025-11-14T12:00:23.731368"
        },
        {
            "id": 6,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:43.176467",
            "valid_until": "2026-11-14T12:00:43.176467",
            "serial_number": "14195893454658783704",
            "is_active": true,
            "created_at": "2025-11-14T12:00:43.178242"
        },
        {
            "id": 7,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:00:01.371684",
            "valid_until": "2026-11-14T14:00:01.371684",
            "serial_number": "13423368161583545335",
            "is_active": true,
            "created_at": "2025-11-14T14:00:01.375002"
        },
        {
            "id": 8,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:00:25.775808",
            "valid_until": "2026-11-14T14:00:25.775808",
            "serial_number": "7065779165814479209",
            "is_active": true,
            "created_at": "2025-11-14T14:00:25.780022"
        },
        {
            "id": 9,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:25:30.623358",
            "valid_until": "2026-11-14T14:25:30.623358",
            "serial_number": "17098717075885615628",
            "is_active": true,
            "created_at": "2025-11-14T14:25:30.627765"
        },
        {
            "id": 10,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:25:34.408041",
            "valid_until": "2026-11-14T14:25:34.408041",
            "serial_number": "1061544153395070501",
            "is_active": true,
            "created_at": "2025-11-14T14:25:34.410441"
        }
    ]

export const usercertsmockdata =
    [
        {
            "id": 1,
            "intermediate_ca_id": 1,
            "common_name": "john.doe@acme.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.253605",
            "valid_until": "2026-11-06T22:41:40.253605",
            "serial_number": "7372327794352391371",
            "is_active": false,
            "created_at": "2025-11-06T22:41:40.257400"
        },
        {
            "id": 3,
            "intermediate_ca_id": 1,
            "common_name": "user@example.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-07T14:26:30.283207",
            "valid_until": "2026-11-07T14:26:30.283207",
            "serial_number": "1756264145815151120",
            "is_active": true,
            "created_at": "2025-11-07T14:26:30.290184"
        },
        {
            "id": 4,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T10:55:02.564116",
            "valid_until": "2026-11-14T10:55:02.564116",
            "serial_number": "4540243803565873181",
            "is_active": true,
            "created_at": "2025-11-14T10:55:02.567685"
        },
        {
            "id": 5,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:23.726510",
            "valid_until": "2026-11-14T12:00:23.726510",
            "serial_number": "9703584742982487789",
            "is_active": true,
            "created_at": "2025-11-14T12:00:23.731368"
        },
        {
            "id": 6,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:43.176467",
            "valid_until": "2026-11-14T12:00:43.176467",
            "serial_number": "14195893454658783704",
            "is_active": true,
            "created_at": "2025-11-14T12:00:43.178242"
        },
        {
            "id": 7,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:00:01.371684",
            "valid_until": "2026-11-14T14:00:01.371684",
            "serial_number": "13423368161583545335",
            "is_active": true,
            "created_at": "2025-11-14T14:00:01.375002"
        }
    ]
export const servercertsmockdata = [
    {
        "id": 2,
        "intermediate_ca_id": 1,
        "common_name": "vpn.acme.com",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-06T22:41:40.453143",
        "valid_until": "2027-11-06T22:41:40.453143",
        "serial_number": "349187585951979826",
        "is_active": true,
        "created_at": "2025-11-06T22:41:40.454993"
    },
    {
        "id": 8,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-14T14:00:25.775808",
        "valid_until": "2026-11-14T14:00:25.775808",
        "serial_number": "7065779165814479209",
        "is_active": true,
        "created_at": "2025-11-14T14:00:25.780022"
    },
    {
        "id": 9,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-14T14:25:30.623358",
        "valid_until": "2026-11-14T14:25:30.623358",
        "serial_number": "17098717075885615628",
        "is_active": true,
        "created_at": "2025-11-14T14:25:30.627765"
    },
    {
        "id": 11,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-15T06:22:24.020342",
        "valid_until": "2026-11-15T06:22:24.020342",
        "serial_number": "3619961327206599303",
        "is_active": true,
        "created_at": "2025-11-15T06:22:24.024083"
    },
    {
        "id": 13,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-17T10:24:01.263451",
        "valid_until": "2026-11-17T10:24:01.263451",
        "serial_number": "7294311737621192141",
        "is_active": true,
        "created_at": "2025-11-17T10:24:01.265993"
    },
    {
        "id": 10,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-14T14:25:34.408041",
        "valid_until": "2026-11-14T14:25:34.408041",
        "serial_number": "1061544153395070501",
        "is_active": true,
        "created_at": "2025-11-14T14:25:34.410441"
    },
    {
        "id": 12,
        "intermediate_ca_id": 2,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-15T06:37:03.214214",
        "valid_until": "2026-11-15T06:37:03.214214",
        "serial_number": "7550681937694809981",
        "is_active": true,
        "created_at": "2025-11-15T06:37:03.216352"
    },
    {
        "id": 14,
        "intermediate_ca_id": 1,
        "common_name": "string",
        "certificate_type": "server",
        "key_length": 2048,
        "valid_from": "2025-11-17T10:51:39.660109",
        "valid_until": "2026-11-17T10:51:39.660109",
        "serial_number": "9363656455750926217",
        "is_active": true,
        "created_at": "2025-11-17T10:51:39.662724"
    }
]