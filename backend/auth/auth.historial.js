const pdf               = require('html-pdf');
const folderPdf         = './public/historialPdf/';
const folderImages      = './public/images/';
const logo              = './public/images/veterinaria_logo.png';
const options = {
  format: "Letter",
  orientation: "landscape",
  border: {
    top:    "0.5in", // default is 0, units: mm, cm, in, px
    right:  "0.5in",
    bottom: "0.5in",
    left:   "0.5in",
  },
};
async function historialPet(data, dataPet) {
  const { id, name, race, species, gender, age } = dataPet;
  return new Promise((resolve, reject) => {
    const bgc = '#F1F1F1';
    let styleTable = 'width: 100%; text-align:center; border-collapse: collapse;';
    let nameFile = '';
    let content = `
            <style>
                span{
                    font-family: cursive;
                    font-size: 10px;
                }
            </style>   
            <table border='1' style='${styleTable}'>
                <tbody>
                    <tr>
                        <td rowspan='3'>Aquí iria la foto</td>
                        <td colspan='2' style='background-color: ${bgc};'><b>VETERINARIA DOCTOR VACCA<b></td>
                    </tr>
                    <tr>
                        <td colspan='2'>Dirección: Calle 10 # 41 - 39      -      Celular: 3112944614</td>
                    </tr>
                    <tr>
                        <td colspan='2'><span><i>Nuestra prioridad es la salud y el bienestar de tu mascota</i></span></td>
                    </tr>
                </tbody>
            </table>
            <br>
            <table border='1' style='${styleTable}'>
                <thead style='background-color: ${bgc};'>
                    <tr>
                        <th>Cedula</th>
                        <th>Nombre</th>
                        <th>Raza</th>
                        <th>Especie</th>
                        <th>Genero</th>
                        <th>Edad</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${id}</td>
                        <td>${name}</td>
                        <td>${race}</td>
                        <td>${species}</td>
                        <td>${gender}</td>
                        <td>${age} Meses</td>
                    </tr>
                </tbody>
            </table>
            <br>
            <table border='1' style='${styleTable}'>
                <thead style='background-color: ${bgc};'>
                    <tr>
                        <th>T. de cita</th>
                        <th>Fecha</th>
                        <th>Resultado</th>
                        <th>Medicado</th>
                        <th>T. Medicado</th>
                        <th>Tratamiento</th>
                        <th>D. Tratamiento</th>
                        <th>Sugerencia</th>
                        <th>T. Sugerencia</th>
                    </tr>
                </thead>`;
    data.forEach((datos) => {
      let fecha = new Date(datos.dateA).toLocaleDateString();
      let hora  = new Date(datos.dateA).toLocaleTimeString('en-US');
      nameFile  = datos.id + datos.name;
      content += `   <tbody>
                    <tr>
                        <td>${datos.typeAppointment}</td>
                        <td>${fecha} - ${hora}</td>
                        <td>${datos.result} Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, non et? Dolorem saepe illum rerum facere voluptas quidem. Atque praesentium quod dolorem a hic neque facilis nihil rem cum non.</td>
                        <td>${datos.medicated}</td>
                        <td>${datos.treatment}</td>
                        <td>${datos.descriptionTreatment}</td>
                        <td>${datos.descriptionM}</td>
                        <td>${datos.surgery}</td>
                        <td>${datos.typeSurgery}</td>
                    </tr>
                </tbody>
            </table>`;
    });
    pdf
      .create(content, options)
      .toFile(`${folderPdf + nameFile}.pdf`, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(`${nameFile}.pdf`);
        }
      });
  });
}
module.exports = historialPet;
