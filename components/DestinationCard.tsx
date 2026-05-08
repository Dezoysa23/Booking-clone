type Props = {
  title: string;
  image: string;
  properties: number;
};

export default function DestinationCard({
  title,
  image,
  properties,
}: Props) {
  return (
    <div className="cursor-pointer overflow-hidden rounded-xl shadow-md transition hover:shadow-xl">
      <div
        className="h-48 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="bg-white p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">
          {properties} properties
        </p>
      </div>
    </div>
  );
}