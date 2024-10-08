export const byte2asm = {};

function init() {
    const tables = {};
    let currentTable;
    for (const s of CODES.split('\n')) {
        const ch = s.split('\t');
        if (ch[0][0]=='#') {
            currentTable = tables[ch[0]] = [];
            continue;
        }
        currentTable[parseInt(ch[0], 16)] = ch.slice(1).join(' ').trim();
    }
    const ed = tables['#ED']
    for (let i=0; i<256; ++i) {
        let s = tables['#'][i];
        if (ed[i]) {
            s = `${s} / [#ED] ${ed[i]}`;
        }
        byte2asm[i] = s;
    };
}

// http://www.z80.info/disz80.txt
const CODES = `#
00	NOP		
01	LD	BC,nn	
02	LD	(BC),A	
03	INC	BC	
04	INC	B	
05	DEC	B	
06	LD	B,n	
07	RLCA		
08	EX	AF,AF'	
09	ADD	HL,BC	
0A	LD	A,(BC)	
0B	DEC	BC	
0C	INC	C	
0D	DEC	C	
0E	LD	C,n	
0F	RRCA		
10	DJNZ	e	
11	LD	DE,nn	
12	LD	(DE),A	
13	INC	DE	
14	INC	D	
15	DEC	D	
16	LD	D,n	
17	RLA		
18	JR	e	
19	ADD	HL,DE	
1A	LD	A,(DE)	
1B	DEC	DE	
1C	INC	E	
1D	DEC	E	
1E	LD	E,n	
1F	RRA		
20	JR	NZ,e	
21	LD	HL,nn	
22	LD	(nn),HL	
23	INC	HL	
24	INC	H	
25	DEC	H	
26	LD	H,n	
27	DAA		
28	JR	Z,e	
29	ADD	HL,HL	
2A	LD	HL,(nn)	
2B	DEC	HL	
2C	INC	L	
2D	DEC	L	
2E	LD	L,n	
2F	CPL		
30	JR	NC,e	
31	LD	SP,nn	
32	LD	(nn),A	
33	INC	SP	
34	INC	(HL)	
35	DEC	(HL)	
36	LD	(HL),n	
37	SCF		
38	JR	C,e	
39	ADD	HL,SP	
3A	LD	A,(nn)	
3B	DEC	SP	
3C	INC	A	
3D	DEC	A	
3E	LD	A,n	
3F	CCF		
40	LD	B,B	
41	LD	B,C	
42	LD	B,D	
43	LD	B,E	
44	LD	B,H	
45	LD	B,L	
46	LD	B,(HL)	
47	LD	B,A	
48	LD	C,B	
49	LD	C,C	
4A	LD	C,D	
4B	LD	C,E	
4C	LD	C,H	
4D	LD	C,L	
4E	LD	C,(HL)	
4F	LD	C,A	
50	LD	D,B	
51	LD	D,C	
52	LD	D,D	
53	LD	D,E	
54	LD	D,H	
55	LD	D,L	
56	LD	D,(HL)	
57	LD	D,A	
58	LD	E,B	
59	LD	E,C	
5A	LD	E,D	
5B	LD	E,E	
5C	LD	E,H	
5D	LD	E,L	
5E	LD	E,(HL)	
5F	LD	E,A	
60	LD	H,B	
61	LD	H,C	
62	LD	H,D	
63	LD	H,E	
64	LD	H,H	
65	LD	H,L	
66	LD	H,(HL)	
67	LD	H,A	
68	LD	L,B	
69	LD	L,C	
6A	LD	L,D	
6B	LD	L,E	
6C	LD	L,H	
6D	LD	L,L	
6E	LD	L,(HL)	
6F	LD	L,A	
70	LD	(HL),B	
71	LD	(HL),C	
72	LD	(HL),D	
73	LD	(HL),E	
74	LD	(HL),H	
75	LD	(HL),L	
76	HALT		
77	LD	(HL),A	
78	LD	A,B	
79	LD	A,C	
7A	LD	A,D	
7B	LD	A,E	
7C	LD	A,H	
7D	LD	A,L	
7E	LD	A,(HL)	
7F	LD	A,A	
80	ADD	A,B	
81	ADD	A,C	
82	ADD	A,D	
83	ADD	A,E	
84	ADD	A,H	
85	ADD	A,L	
86	ADD	A,(HL)	
87	ADD	A,A	
88	ADC	A,B	
89	ADC	A,C	
8A	ADC	A,D	
8B	ADC	A,E	
8C	ADC	A,H	
8D	ADC	A,L	
8E	ADC	A,(HL)	
8F	ADC	A,A	
90	SUB	B	
91	SUB	C	
92	SUB	D	
93	SUB	E	
94	SUB	H	
95	SUB	L	
96	SUB	(HL)	
97	SUB	A	
98	SBC	B	
99	SBC	C	
9A	SBC	D	
9B	SBC	E	
9C	SBC	H	
9D	SBC	L	
9E	SBC	(HL)	
9F	SBC	A	
A0	AND	B	
A1	AND	C	
A2	AND	D	
A3	AND	E	
A4	AND	H	
A5	AND	L	
A6	AND	(HL)	
A7	AND	A	
A8	XOR	B	
A9	XOR	C	
AA	XOR	D	
AB	XOR	E	
AC	XOR	H	
AD	XOR	L	
AE	XOR	(HL)	
AF	XOR	A	
B0	OR	B	
B1	OR	C	
B2	OR	D	
B3	OR	E	
B4	OR	H	
B5	OR	L	
B6	OR	(HL)	
B7	OR	A	
B8	CP	B	
B9	CP	C	
BA	CP	D	
BB	CP	E	
BC	CP	H	
BD	CP	L	
BE	CP	(HL)	
BF	CP	A	
C0	RET	NZ	
C1	POP	BC	
C2	JP	NZ,nn	
C3	JP	nn	
C4	CALL	NZ,nn	
C5	PUSH	BC	
C6	ADD	A,n	
C7	RST	00H	
C8	RET	Z	
C9	RET		
CA	JP	Z,nn	
CB	#CB		
CC	CALL	Z,nn	
CD	CALL	nn	
CE	ADC	A,n	
CF	RST	08H	
D0	RET	NC	
D1	POP	DE	
D2	JP	NC,nn	
D3	OUT	(n),A	
D4	CALL	NC,nn	
D5	PUSH	DE	
D6	SUB	n	
D7	RST	10H	
D8	RET	C	
D9	EXX		
DA	JP	C,nn	
DB	IN	A,(n)	
DC	CALL	C,nn	
DD	#DD		
DE	SBC	A,n	
DF	RST	18H	
E0	RET	PO	
E1	POP	HL	
E2	JP	PO,nn	
E3	EX	(SP),HL	
E4	CALL	PO,nn	
E5	PUSH	HL	
E6	AND	n	
E7	RST	20H	
E8	RET	PE	
E9	JP	(HL)	
EA	JP	PE,nn	
EB	EX	DE,HL	
EC	CALL	PE,nn	
ED	#ED		
EE	XOR	n	
EF	RST	28H	
F0	RET	P	
F1	POP	AF	
F2	JP	P,nn	
F3	DI		
F4	CALL	P,nn	
F5	PUSH	AF	
F6	OR	n	
F7	RST	30H	
F8	RET	M	
F9	LD	SP,HL	
FA	JP	M,nn	
FB	EI		
FC	CALL	M,nn	
FD	#FD		
FE	CP	n	
FF	RST	38H	
#CB
00	RLC	B	
01	RLC	C	
02	RLC	D	
03	RLC	E	
04	RLC	H	
05	RLC	L	
06	RLC	(HL)	
07	RLC	A	
08	RRC	B	
09	RRC	C	
0A	RRC	D	
0B	RRC	E	
0C	RRC	H	
0D	RRC	L	
0E	RRC	(HL)	
0F	RRC	A	
10	RL	B	
11	RL	C	
12	RL	D	
13	RL	E	
14	RL	H	
15	RL	L	
16	RL	(HL)	
17	RL	A	
18	RR	B	
19	RR	C	
1A	RR	D	
1B	RR	E	
1C	RR	H	
1D	RR	L	
1E	RR	(HL)	
1F	RR	A	
20	SLA	B	
21	SLA	C	
22	SLA	D	
23	SLA	E	
24	SLA	H	
25	SLA	L	
26	SLA	(HL)	
27	SLA	A	
28	SRA	B	
29	SRA	C	
2A	SRA	D	
2B	SRA	E	
2C	SRA	H	
2D	SRA	L	
2E	SRA	(HL)	
2F	SRA	A	
30			
31			
32			
33			
34			
35			
36			
37			
38	SRL	B	
39	SRL	C	
3A	SRL	D	
3B	SRL	E	
3C	SRL	H	
3D	SRL	L	
3E	SRL	(HL)	
3F	SRL	A	
40	BIT	0,B	
41	BIT	0,C	
42	BIT	0,D	
43	BIT	0,E	
44	BIT	0,H	
45	BIT	0,L	
46	BIT	0,(HL)	
47	BIT	0,A	
48	BIT	1,B	
49	BIT	1,C	
4A	BIT	1,D	
4B	BIT	1,E	
4C	BIT	1,H	
4D	BIT	1,L	
4E	BIT	1,(HL)	
4F	BIT	1,A	
50	BIT	2,B	
51	BIT	2,C	
52	BIT	2,D	
53	BIT	2,E	
54	BIT	2,H	
55	BIT	2,L	
56	BIT	2,(HL)	
57	BIT	2,A	
58	BIT	3,B	
59	BIT	3,C	
5A	BIT	3,D	
5B	BIT	3,E	
5C	BIT	3,H	
5D	BIT	3,L	
5E	BIT	3,(HL)	
5F	BIT	3,A	
60	BIT	4,B	
61	BIT	4,C	
62	BIT	4,D	
63	BIT	4,E	
64	BIT	4,H	
65	BIT	4,L	
66	BIT	4,(HL)	
67	BIT	4,A	
68	BIT	5,B	
69	BIT	5,C	
6A	BIT	5,D	
6B	BIT	5,E	
6C	BIT	5,H	
6D	BIT	5,L	
6E	BIT	5,(HL)	
6F	BIT	5,A	
70	BIT	6,B	
71	BIT	6,C	
72	BIT	6,D	
73	BIT	6,E	
74	BIT	6,H	
75	BIT	6,L	
76	BIT	6,(HL)	
77	BIT	6,A	
78	BIT	7,B	
79	BIT	7,C	
7A	BIT	7,D	
7B	BIT	7,E	
7C	BIT	7,H	
7D	BIT	7,L	
7E	BIT	7,(HL)	
7F	BIT	7,A	
80	RES	0,B	
81	RES	0,C	
82	RES	0,D	
83	RES	0,E	
84	RES	0,H	
85	RES	0,L	
86	RES	0,(HL)	
87	RES	0,A	
88	RES	1,B	
89	RES	1,C	
8A	RES	1,D	
8B	RES	1,E	
8C	RES	1,H	
8D	RES	1,L	
8E	RES	1,(HL)	
8F	RES	1,A	
90	RES	2,B	
91	RES	2,C	
92	RES	2,D	
93	RES	2,E	
94	RES	2,H	
95	RES	2,L	
96	RES	2,(HL)	
97	RES	2,A	
98	RES	3,B	
99	RES	3,C	
9A	RES	3,D	
9B	RES	3,E	
9C	RES	3,H	
9D	RES	3,L	
9E	RES	3,(HL)	
9F	RES	3,A	
A0	RES	4,B	
A1	RES	4,C	
A2	RES	4,D	
A3	RES	4,E	
A4	RES	4,H	
A5	RES	4,L	
A6	RES	4,(HL)	
A7	RES	4,A	
A8	RES	5,B	
A9	RES	5,C	
AA	RES	5,D	
AB	RES	5,E	
AC	RES	5,H	
AD	RES	5,L	
AE	RES	5,(HL)	
AF	RES	5,A	
B0	RES	6,B	
B1	RES	6,C	
B2	RES	6,D	
B3	RES	6,E	
B4	RES	6,H	
B5	RES	6,L	
B6	RES	6,(HL)	
B7	RES	6,A	
B8	RES	7,B	
B9	RES	7,C	
BA	RES	7,D	
BB	RES	7,E	
BC	RES	7,H	
BD	RES	7,L	
BE	RES	7,(HL)	
BF	RES	7,A	
C0	SET	0,B	
C1	SET	0,C	
C2	SET	0,D	
C3	SET	0,E	
C4	SET	0,H	
C5	SET	0,L	
C6	SET	0,(HL)	
C7	SET	0,A	
C8	SET	1,B	
C9	SET	1,C	
CA	SET	1,D	
CB	SET	1,E	
CC	SET	1,H	
CD	SET	1,L	
CE	SET	1,(HL)	
CF	SET	1,A	
D0	SET	2,B	
D1	SET	2,C	
D2	SET	2,D	
D3	SET	2,E	
D4	SET	2,H	
D5	SET	2,L	
D6	SET	2,(HL)	
D7	SET	2,A	
D8	SET	3,B	
D9	SET	3,C	
DA	SET	3,D	
DB	SET	3,E	
DC	SET	3,H	
DD	SET	3,L	
DE	SET	3,(HL)	
DF	SET	3,A	
E0	SET	4,B	
E1	SET	4,C	
E2	SET	4,D	
E3	SET	4,E	
E4	SET	4,H	
E5	SET	4,L	
E6	SET	4,(HL)	
E7	SET	4,A	
E8	SET	5,B	
E9	SET	5,C	
EA	SET	5,D	
EB	SET	5,E	
EC	SET	5,H	
ED	SET	5,L	
EE	SET	5,(HL)	
EF	SET	5,A	
F0	SET	6,B	
F1	SET	6,C	
F2	SET	6,D	
F3	SET	6,E	
F4	SET	6,H	
F5	SET	6,L	
F6	SET	6,(HL)	
F7	SET	6,A	
F8	SET	7,B	
F9	SET	7,C	
FA	SET	7,D	
FB	SET	7,E	
FC	SET	7,H	
FD	SET	7,L	
FE	SET	7,(HL)	
FF	SET	7,A	
#DD
00			
01			
02			
03			
04			
05			
06			
07			
08			
09	ADD	IX,BC	
0A			
0B			
0C			
0D			
0E			
0F			
10			
11			
12			
13			
14			
15			
16			
17			
18			
19	ADD	IX,DE	
1A			
1B			
1C			
1D			
1E			
1F			
20			
21	LD	IX,nn	
22	LD	(nn),IX	
23	INC	IX	
24			
25			
26			
27			
28			
29	ADD	IX,IX	
2A	LD	IX,(nn)	
2B	DEC	IX	
2C			
2D			
2E			
2F			
30			
31			
32			
33			
34	INC	(IX+d)	
35	DEC	(IX+d)	
36			
37			
38			
39	ADD	IX,SP	
3A			
3B			
3C			
3D			
3E			
3F			
40			
41			
42			
43			
44			
45			
46	LD	B,(IX+d)
47			
48			
49			
4A			
4B			
4C			
4D			
4E	LD	C,(IX+d)
4F			
50			
51			
52			
53			
54			
55			
56	LD	D,(IX+d)
57			
58			
59			
5A			
5B			
5C			
5D			
5E	LD	E,(IX+d)
5F			
60			
61			
62			
63			
64			
65			
66	LD	H,(IX+d)
67			
68			
69			
6A			
6B			
6C			
6D			
6E	LD	L,(IX+d)
6F			
70	LD	(IX+d),B
71	LD	(IX+d),C
72	LD	(IX+d),D
73	LD	(IX+d),E
74	LD	(IX+d),H
75	LD	(IX+d),L
76			
77	LD	(IX+d),A
78			
79			
7A			
7B			
7C			
7D			
7E	LD	A,(IX+d)
7F			
80			
81			
82			
83			
84			
85			
86	ADD	A,(IX+d)
87			
88			
89			
8A			
8B			
8C			
8D			
8E	ADC	A,(IX+d)
8F			
90			
91			
92			
93			
94			
95			
96	SUB	(IX+d)	
97			
98			
99			
9A			
9B			
9C			
9D			
9E	SBC	(IX+d)	
9F			
A0			
A1			
A2			
A3			
A4			
A5			
A6	AND	(IX+d)	
A7			
A8			
A9			
AA			
AB			
AC			
AD			
AE	XOR	(IX+d)	
AF			
B0			
B1			
B2			
B3			
B4			
B5			
B6	OR	(IX+d)	
B7			
B8			
B9			
BA			
BB			
BC			
BD			
BE	CP	(IX+d)	
BF			
C0			
C1			
C2			
C3			
C4			
C5			
C6			
C7			
C8			
C9			
CA			
CB	#DDCB		
CC			
CD			
CE			
CF			
D0			
D1			
D2			
D3			
D4			
D5			
D6			
D7			
D8			
D9			
DA			
DB			
DC			
DD			
DE			
DF			
E0			
E1	POP	IX	
E2			
E3	EX	(SP),IX	
E4			
E5	PUSH	IX	
E6			
E7			
E8			
E9	JP	(IX)	
EA			
EB			
EC			
ED			
EE			
EF			
F0			
F1			
F2			
F3			
F4			
F5			
F6			
F7			
F8			
F9	LD	SP,IX	
FA			
FB			
FC			
FD			
FE			
FF			
#ED
00			
01			
02			
03			
04			
05			
06			
07			
08			
09			
0A			
0B			
0C			
0D			
0E			
0F			
10			
11			
12			
13			
14			
15			
16			
17			
18			
19			
1A			
1B			
1C			
1D			
1E			
1F			
20			
21			
22			
23			
24			
25			
26			
27			
28			
29			
2A			
2B			
2C			
2D			
2E			
2F			
30			
31			
32			
33			
34			
35			
36			
37			
38			
39			
3A			
3B			
3C			
3D			
3E			
3F			
40	IN	B,(C)	
41	OUT	(C),B	
42	SBC	HL,BC	
43	LD	(nn),BC	
44	NEG		
45	RETN		
46	IM	0	
47	LD	I,A	
48	IN	C,(C)	
49	OUT	(C),C	
4A	ADC	HL,BC	
4B	LD	BC,(nn)	
4C			
4D	RETI		
4E			
4F	LD	R,A	
50	IN	D,(C)	
51	OUT	(C),D	
52	SBC	HL,DE	
53	LD	(nn),DE	
54			
55			
56	IM	1	
57	LD	A,I	
58	IN	E,(C)	
59	OUT	(C),E	
5A	ADC	HL,DE	
5B	LD	DE,(nn)	
5C			
5D			
5E	IM	2	
5F	LD	A,R	
60	IN	H,(C)	
61	OUT	(C),H	
62	SBC	HL,HL	
63			
64			
65			
66			
67	RRD		
68	IN	L,(C)	
69	OUT	(C),L	
6A	ADC	HL,HL	
6B			
6C			
6D			
6E			
6F	RLD		
70			
71			
72	SBC	HL,SP	
73	LD	(nn),SP	
74			
75			
76			
77			
78	IN	A,(C)	
79	OUT	(C),A	
7A	ADC	HL,SP	
7B	LD	SP,(nn)	
7C			
7D			
7E			
7F			
80			
81			
82			
83			
84			
85			
86			
87			
88			
89			
8A			
8B			
8C			
8D			
8E			
8F			
90			
91			
92			
93			
94			
95			
96			
97			
98			
99			
9A			
9B			
9C			
9D			
9E			
9F			
A0	LDI		
A1	CPI		
A2	INI		
A3	OUTI		
A4			
A5			
A6			
A7			
A8	LDD		
A9	CPD		
AA	IND		
AB	OUTD		
AC			
AD			
AE			
AF			
B0	LDIR		
B1	CPIR		
B2	INIR		
B3	OTIR		
B4			
B5			
B6			
B7			
B8	LDDR		
B9	CPDR		
BA	INDR		
BB	OTDR		
BC			
BD			
BE			
BF			
C0			
C1			
C2			
C3			
C4			
C5			
C6			
C7			
C8			
C9			
CA			
CB			
CC			
CD			
CE			
CF			
D0			
D1			
D2			
D3			
D4			
D5			
D6			
D7			
D8			
D9			
DA			
DB			
DC			
DD			
DE			
DF			
E0			
E1			
E2			
E3			
E4			
E5			
E6			
E7			
E8			
E9			
EA			
EB			
EC			
ED			
EE			
EF			
F0			
F1			
F2			
F3			
F4			
F5			
F6			
F7			
F8			
F9			
FA			
FB			
FC			
FD			
FE			
FF			
#FD
00			
01			
02			
03			
04			
05			
06			
07			
08			
09	ADD	IY,BC	
0A			
0B			
0C			
0D			
0E			
0F			
10			
11			
12			
13			
14			
15			
16			
17			
18			
19	ADD	IY,DE	
1A			
1B			
1C			
1D			
1E			
1F			
20			
21	LD	IY,nn	
22	LD	(nn),IY	
23	INC	IY	
24			
25			
26			
27			
28			
29	ADD	IY,IY	
2A	LD	IY,(nn)	
2B	DEC	IY	
2C			
2D			
2E			
2F			
30			
31			
32			
33			
34	INC	(IY+d)	
35	DEC	(IY+d)	
36			
37			
38			
39	ADD	IY,SP	
3A			
3B			
3C			
3D			
3E			
3F			
40			
41			
42			
43			
44			
45			
46	LD	B,(IY+d)
47			
48			
49			
4A			
4B			
4C			
4D			
4E	LD	C,(IY+d)
4F			
50			
51			
52			
53			
54			
55			
56	LD	D,(IY+d)
57			
58			
59			
5A			
5B			
5C			
5D			
5E	LD	E,(IY+d)
5F			
60			
61			
62			
63			
64			
65			
66	LD	H,(IY+d)
67			
68			
69			
6A			
6B			
6C			
6D			
6E	LD	L,(IY+d)
6F			
70	LD	(IY+d),B
71	LD	(IY+d),C
72	LD	(IY+d),D
73	LD	(IY+d),E
74	LD	(IY+d),H
75	LD	(IY+d),L
76			
77	LD	(IY+d),A
78			
79			
7A			
7B			
7C			
7D			
7E	LD	A,(IY+d)
7F			
80			
81			
82			
83			
84			
85			
86	ADD	A,(IY+d)
87			
88			
89			
8A			
8B			
8C			
8D			
8E	ADC	A,(IY+d)
8F			
90			
91			
92			
93			
94			
95			
96	SUB	(IY+d)	
97			
98			
99			
9A			
9B			
9C			
9D			
9E	SBC	(IY+d)	
9F			
A0			
A1			
A2			
A3			
A4			
A5			
A6	AND	(IY+d)	
A7			
A8			
A9			
AA			
AB			
AC			
AD			
AE	XOR	(IY+d)	
AF			
B0			
B1			
B2			
B3			
B4			
B5			
B6	OR	(IY+d)	
B7			
B8			
B9			
BA			
BB			
BC			
BD			
BE	CP	(IY+d)	
BF			
C0			
C1			
C2			
C3			
C4			
C5			
C6			
C7			
C8			
C9			
CA			
CB	#FDCB		
CC			
CD			
CE			
CF			
D0			
D1			
D2			
D3			
D4			
D5			
D6			
D7			
D8			
D9			
DA			
DB			
DC			
DD			
DE			
DF			
E0			
E1	POP	IY	
E2			
E3	EX	(SP),IY	
E4			
E5	PUSH	IY	
E6			
E7			
E8			
E9	JP	(IY)	
EA			
EB			
EC			
ED			
EE			
EF			
F0			
F1			
F2			
F3			
F4			
F5			
F6			
F7			
F8			
F9	LD	SP,IY	
FA			
FB			
FC			
FD			
FE			
FF			
#DDCB
00			
01			
02			
03			
04			
05			
06	RLC	(IX+d)	
07			
08			
09			
0A			
0B			
0C			
0D			
0E	RRC	(IX+d)	
0F			
10			
11			
12			
13			
14			
15			
16	RL	(IX+d)	
17			
18			
19			
1A			
1B			
1C			
1D			
1E	RR	(IX+d)	
1F			
20			
21			
22			
23			
24			
25			
26	SLA	(IX+d)	
27			
28			
29			
2A			
2B			
2C			
2D			
2E	SRA	(IX+d)	
2F			
30			
31			
32			
33			
34			
35			
36			
37			
38			
39			
3A			
3B			
3C			
3D			
3E	SRL	(IX+d)	
3F			
40			
41			
42			
43			
44			
45			
46	BIT	0,(IX+d)
47			
48			
49			
4A			
4B			
4C			
4D			
4E	BIT	1,(IX+d)
4F			
50			
51			
52			
53			
54			
55			
56	BIT	2,(IX+d)
57			
58			
59			
5A			
5B			
5C			
5D			
5E	BIT	3,(IX+d)
5F			
60			
61			
62			
63			
64			
65			
66	BIT	4,(IX+d)
67			
68			
69			
6A			
6B			
6C			
6D			
6E	BIT	5,(IX+d)
6F			
70			
71			
72			
73			
74			
75			
76	BIT	6,(IX+d)
77			
78			
79			
7A			
7B			
7C			
7D			
7E	BIT	7,(IX+d)
7F			
80			
81			
82			
83			
84			
85			
86	RES	0,(IX+d)
87			
88			
89			
8A			
8B			
8C			
8D			
8E	RES	1,(IX+d)
8F			
90			
91			
92			
93			
94			
95			
96	RES	2,(IX+d)
97			
98			
99			
9A			
9B			
9C			
9D			
9E	RES	3,(IX+d)
9F			
A0			
A1			
A2			
A3			
A4			
A5			
A6	RES	4,(IX+d)
A7			
A8			
A9			
AA			
AB			
AC			
AD			
AE	RES	5,(IX+d)
AF			
B0			
B1			
B2			
B3			
B4			
B5			
B6	RES	6,(IX+d)
B7			
B8			
B9			
BA			
BB			
BC			
BD			
BE	RES	7,(IX+d)
BF			
C0			
C1			
C2			
C3			
C4			
C5			
C6	SET	0,(IX+d)
C7			
C8			
C9			
CA			
CB			
CC			
CD			
CE	SET	1,(IX+d)
CF			
D0			
D1			
D2			
D3			
D4			
D5			
D6	SET	2,(IX+d)
D7			
D8			
D9			
DA			
DB			
DC			
DD			
DE	SET	3,(IX+d)
DF			
E0			
E1			
E2			
E3			
E4			
E5			
E6	SET	4,(IX+d)
E7			
E8			
E9			
EA			
EB			
EC			
ED			
EE	SET	5,(IX+d)
EF			
F0			
F1			
F2			
F3			
F4			
F5			
F6	SET	6,(IX+d)
F7			
F8			
F9			
FA			
FB			
FC			
FD			
FE	SET	7,(IX+d)
FF			
#FDCB
00			
01			
02			
03			
04			
05			
06	RLC	(IY+d)	
07			
08			
09			
0A			
0B			
0C			
0D			
0E	RRC	(IY+d)	
0F			
10			
11			
12			
13			
14			
15			
16	RL	(IY+d)	
17			
18			
19			
1A			
1B			
1C			
1D			
1E	RR	(IY+d)	
1F			
20			
21			
22			
23			
24			
25			
26	SLA	(IY+d)	
27			
28			
29			
2A			
2B			
2C			
2D			
2E	SRA	(IY+d)	
2F			
30			
31			
32			
33			
34			
35			
36			
37			
38			
39			
3A			
3B			
3C			
3D			
3E	SRL	(IY+d)	
3F			
40			
41			
42			
43			
44			
45			
46	BIT	0,(IY+d)
47			
48			
49			
4A			
4B			
4C			
4D			
4E	BIT	1,(IY+d)
4F			
50			
51			
52			
53			
54			
55			
56	BIT	2,(IY+d)
57			
58			
59			
5A			
5B			
5C			
5D			
5E	BIT	3,(IY+d)
5F			
60			
61			
62			
63			
64			
65			
66	BIT	4,(IY+d)
67			
68			
69			
6A			
6B			
6C			
6D			
6E	BIT	5,(IY+d)
6F			
70			
71			
72			
73			
74			
75			
76	BIT	6,(IY+d)
77			
78			
79			
7A			
7B			
7C			
7D			
7E	BIT	7,(IY+d)
7F			
80			
81			
82			
83			
84			
85			
86	RES	0,(IY+d)
87			
88			
89			
8A			
8B			
8C			
8D			
8E	RES	1,(IY+d)
8F			
90			
91			
92			
93			
94			
95			
96	RES	2,(IY+d)
97			
98			
99			
9A			
9B			
9C			
9D			
9E	RES	3,(IY+d)
9F			
A0			
A1			
A2			
A3			
A4			
A5			
A6	RES	4,(IY+d)
A7			
A8			
A9			
AA			
AB			
AC			
AD			
AE	RES	5,(IY+d)
AF			
B0			
B1			
B2			
B3			
B4			
B5			
B6	RES	6,(IY+d)
B7			
B8			
B9			
BA			
BB			
BC			
BD			
BE	RES	7,(IY+d)
BF			
C0			
C1			
C2			
C3			
C4			
C5			
C6	SET	0,(IY+d)
C7			
C8			
C9			
CA			
CB			
CC			
CD			
CE	SET	1,(IY+d)
CF			
D0			
D1			
D2			
D3			
D4			
D5			
D6	SET	2,(IY+d)
D7			
D8			
D9			
DA			
DB			
DC			
DD			
DE	SET	3,(IY+d)
DF			
E0			
E1			
E2			
E3			
E4			
E5			
E6	SET	4,(IY+d)
E7			
E8			
E9			
EA			
EB			
EC			
ED			
EE	SET	5,(IY+d)
EF			
F0			
F1			
F2			
F3			
F4			
F5			
F6	SET	6,(IY+d)
F7			
F8			
F9			
FA			
FB			
FC			
FD			
FE	SET	7,(IY+d)
FF			
`;

init();