const getDataTable = (formValues) =>
  Promise.resolve({
    data: {
      status: 200,
      success: true,
      data: [
        {
          fecha: "02/03/2020",
          pedido: 48382,
          nombre: "Jorge Diaz",
          dirección: "Parana 51",
          cpa: 1111,
          ciudad: "CABA",
          provincia: "Buenos Aires",
          caja: 1,
          envío: "Terminal",
          guía: "SADA312",
          estado: "Pendiente",
        },
        {
          fecha: "04/03/2020",
          pedido: 34382,
          nombre: "Manuel Ramirez Diaz",
          dirección: "Santa Fe 51",
          cpa: 1111,
          ciudad: "NQN",
          provincia: "Neuquén",
          caja: 1,
          envío: "Domicilio",
          guía: "TUR1234",
          estado: "Despachado",
        },
        {
          fecha: "06/03/2020",
          pedido: 6543,
          nombre: "Jorge Herrera",
          dirección: "Bariloche 51",
          cpa: 1111,
          ciudad: "BAR",
          provincia: "Rio Negro",
          caja: 3,
          envío: "Terminal",
          guía: "POS125",
          estado: "En Tramite",
        },
        {
          fecha: "07/03/2020",
          pedido: 48382,
          nombre: "Alberto Diaz",
          dirección: "Leloir 51",
          cpa: 9328,
          ciudad: "CABA",
          provincia: "Buenos Aires",
          caja: 6,
          envío: "Terminal",
          guía: "PLR3124",
          estado: "Entregado",
        },
      ],
    },
  });

export default { getDataTable };
