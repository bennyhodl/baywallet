import axios from "axios"

const getLndRequest = async (endpoint: string) => {
  try {
    const mac = "0201036c6e6402f801030a102374d8cda2d93c7f71c64d0b9c42d1121201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620a4737f88d71b2ee54a13ddf4e922262be87745b4d362083209242bcc502bf829"
    const thing = await axios.request({
      baseURL: "http://127.0.0.1:8080",
      url: "/v1/getinfo",
      headers: {
        "Grpc-Metadata-macaroon": mac
      }
    })
    return thing
  } catch (e) {
  }
}

export const getInfo = async () => {
  try {
    const info = await getLndRequest("/v1/getinfo")
    return info
  } catch (e) {
  }
}