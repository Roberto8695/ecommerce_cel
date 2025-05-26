'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
// Importar autoTable de forma diferente para resolver el problema
import autoTable from 'jspdf-autotable';

export default function ThankyouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Obtener parámetros de la URL
  useEffect(() => {
    const orderID = searchParams.get('orderID');
    const total = searchParams.get('total');
    const email = searchParams.get('email');
    const date = searchParams.get('date') || new Date().toISOString();
    
    if (!orderID || !total) {
      // Si no hay ID de orden o total, redirigir al catálogo
      router.push('/catalogo');
      toast.error('No se encontró información de la compra', {
        position: 'bottom-right',
        duration: 4000
      });
      return;
    }    // Intentar parsear los items del carrito
    let items = [];
    try {
      const itemsStr = searchParams.get('items');
      if (itemsStr) {
        items = JSON.parse(decodeURIComponent(itemsStr));
        console.log('Items decodificados:', items);
      }
    } catch (error) {
      console.error('Error al parsear los items del carrito:', error);
      // Continuar con un array vacío
    }

    // Calcular el total real basado en los items para verificar
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (item.precio * item.quantity);
    }, 0);

    // Usar el total calculado si difiere significativamente del total pasado
    const parsedTotal = parseFloat(total);
    const finalTotal = Math.abs(parsedTotal - calculatedTotal) > 1 ? calculatedTotal : parsedTotal;

    setOrderData({
      orderID,
      total: finalTotal,
      email: email || 'cliente@ejemplo.com',
      date: new Date(date),
      items
    });
      console.log('Datos de orden cargados:', {
      orderID,
      totalPasado: parseFloat(total),
      totalCalculado: calculatedTotal,
      totalFinal: finalTotal,
      email,
      date,
      items
    });
    
    setIsLoading(false);
  }, [router, searchParams]);
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  // Generar PDF con los datos de la factura
  const generateInvoice = () => {
    if (!orderData) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF();
        // Añadir título
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text('FACTURA', 105, 20, { align: 'center' });
      
      // Añadir logo (puedes ajustar esto o quitarlo)
      // doc.addImage('/img/logo.png', 'PNG', 10, 10, 50, 20);
      
      // Información de la empresa
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('ECommerce Cel', 10, 40);
      doc.text('Calle Principal #123', 10, 45);
      doc.text('Ciudad Cochabamba, Bolivia', 10, 50);
      doc.text('RFC: 123456789', 10, 55);
        // Información del cliente y factura
      doc.setFontSize(11);
      doc.text(`Factura #: ${orderData.orderID}`, 140, 40);
      doc.text(`Fecha: ${orderData.date.toLocaleDateString('es-MX')}`, 140, 45);
      doc.text(`Cliente: ${orderData.email}`, 140, 50);
      
      // Contenido de la factura (tabla de productos)
      const tableColumn = ["Cantidad", "Producto", "Precio Unit.", "Subtotal"];
      const tableRows = [];
      
      // Agregar productos si existen
      if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach(item => {
          const subtotal = item.precio * item.quantity;
          const productData = [
            item.quantity,
            item.nombre,
            formatPrice(item.precio),
            formatPrice(subtotal)
          ];
          tableRows.push(productData);
        });
      } else {
        // Si no hay productos detallados, agregar una fila genérica
        tableRows.push([1, "Productos", formatPrice(orderData.total), formatPrice(orderData.total)]);
      }
        // Generar la tabla con los productos
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        styles: { fontSize: 10 }
      });
        // Calcular la posición Y después de la tabla
      const finalY = (doc.lastAutoTable.finalY || 70) + 10;
        // Calcular subtotal (sin IVA)
      const subtotal = parseFloat((orderData.total / 1.16).toFixed(2)); // Asumiendo que el total ya incluye IVA del 16%
      const iva = parseFloat((orderData.total - subtotal).toFixed(2));
      
      // Añadir subtotal, IVA y total
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal: ${formatPrice(subtotal)}`, 150, finalY, { align: 'right' });
      doc.text(`IVA (16%): ${formatPrice(iva)}`, 150, finalY + 6, { align: 'right' });
      
      // Añadir el total
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatPrice(orderData.total)}`, 150, finalY + 12, { align: 'right' });
        // Añadir pie de página
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Gracias por tu compra', 105, finalY + 25, { align: 'center' });
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, 105, finalY + 30, { align: 'center' });
        // Guardar PDF
      const fecha = new Date().toISOString().split('T')[0];
      doc.save(`factura-${orderData.orderID}-${fecha}.pdf`);
      
      toast.success('Factura generada correctamente', {
        position: 'bottom-right',
        duration: 3000
      });
    } catch (error) {
      console.error('Error al generar la factura:', error);
      toast.error('Error al generar la factura', {
        position: 'bottom-right',
        duration: 3000
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="rounded-full bg-green-100 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">¡Gracias por tu compra!</h1>
          <p className="text-gray-600 mb-8">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <p className="text-gray-600 mb-3">Número de orden: <span className="font-semibold">{orderData?.orderID}</span></p>
            <p className="text-gray-600 mb-3">Total pagado: <span className="font-semibold">{formatPrice(orderData?.total || 0)}</span></p>
            <p className="text-gray-600 mb-3">Fecha: <span className="font-semibold">{orderData?.date.toLocaleDateString('es-MX')}</span></p>
            <p className="text-gray-600">Email: <span className="font-semibold">{orderData?.email}</span></p>
          </div>
          
          {/* Resumen de productos si están disponibles */}
          {orderData?.items && orderData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos adquiridos:</h2>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {item.quantity}x {item.nombre}
                    </span>
                    <span className="text-gray-900 font-medium">{formatPrice(item.precio * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-8">
            Recibirás un email con los detalles de tu compra en breve.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateInvoice}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                isGeneratingPdf 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {isGeneratingPdf ? 'Generando...' : 'Descargar factura'}
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center px-6 py-3 border border-indigo-300 text-indigo-700 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}