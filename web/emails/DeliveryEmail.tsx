import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";

type DeliveryEmailProps = {
  orderNumber: number;
  items: { title: string; deliveryUrl: string }[];
};

export function DeliveryEmail({ orderNumber, items }: DeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Tus accesos del pedido #${orderNumber} en Fut Prov`}</Preview>
      <Body style={{ backgroundColor: "#0b0d10", fontFamily: "Helvetica, Arial, sans-serif", padding: "2rem 0" }}>
        <Container style={{ backgroundColor: "#14171b", borderRadius: "12px", padding: "2rem", maxWidth: "480px" }}>
          <Heading style={{ color: "#e7e9ec", fontSize: "20px" }}>¡Pago confirmado!</Heading>
          <Text style={{ color: "#8a919c", fontSize: "14px" }}>
            Pedido #{orderNumber}. Aquí tienes el acceso a cada proveedor que compraste. Los enlaces son válidos
            durante 30 días.
          </Text>
          <Section>
            {items.map((item, i) => (
              <Section key={i} style={{ marginTop: "1rem" }}>
                <Text style={{ color: "#e7e9ec", fontSize: "15px", fontWeight: 600, margin: 0 }}>{item.title}</Text>
                <Link
                  href={item.deliveryUrl}
                  style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Ver mi acceso
                </Link>
              </Section>
            ))}
          </Section>
          <Text style={{ color: "#8a919c", fontSize: "12px", marginTop: "2rem" }}>Fut Prov</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DeliveryEmail;
