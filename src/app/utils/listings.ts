import { Job } from "../../types/domain";

export function getListingTypeLabel(listingType: Job["listingType"]) {
  return listingType === "service" ? "Servicio" : "Pedido";
}

export function getListingTypePluralLabel(listingType: Job["listingType"]) {
  return listingType === "service" ? "servicios" : "changas";
}

export function getListingActionCopy(listingType: Job["listingType"]) {
  if (listingType === "service") {
    return {
      publishTitle: "Publicá tu servicio",
      publishSuccess: "Tu servicio ya está publicado",
      publishSuccessDescription: "Ahora las personas de tu zona pueden descubrirlo y pedirte presupuesto.",
      editTitle: "Editar servicio",
      searchTitle: "Explorar servicios y changas",
      detailOwnerSection: "Solicitudes recibidas",
      detailApplyTitle: "Solicitar servicio",
      detailApplySuccess: "Solicitud enviada",
      detailApplySuccessDescription: "La persona que ofrece el servicio ya puede revisar tu mensaje y responderte.",
      ownerEmptyApplicants: "Cuando alguien te escriba para contratar este servicio, vas a poder gestionarlo desde acá.",
      applicantAccepted: "Servicio confirmado",
      applicantPending: "Solicitud enviada",
      applicantRejected: "Solicitud rechazada",
      cardPricePrefix: "Desde",
    };
  }

  return {
    publishTitle: "Publicá una changa",
    publishSuccess: "Tu changa ya está publicada",
    publishSuccessDescription: "Ahora las personas de tu zona la pueden ver y responder.",
    editTitle: "Editar changa",
    searchTitle: "Explorar changas y servicios",
    detailOwnerSection: "Postulantes",
    detailApplyTitle: "Postularme",
    detailApplySuccess: "Postulación enviada",
    detailApplySuccessDescription: "Ahora el cliente puede revisar tu propuesta y responderte.",
    ownerEmptyApplicants: "Cuando alguien se postule, vas a poder aceptarlo o rechazarlo desde acá.",
    applicantAccepted: "Postulación aceptada",
    applicantPending: "Postulación enviada",
    applicantRejected: "Postulación rechazada",
    cardPricePrefix: "",
  };
}
